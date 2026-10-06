"""Fine-tune a multilingual sequence classifier for Guidia.

    python ml/training/train.py --task intent  --version 0.1.0
    python ml/training/train.py --task safety  --version 0.1.0

Base model: FacebookAI/xlm-roberta-base (multilingual: en, bn, hi, vi).
Output:     ml/runs/<task>-<version>/   (model, tokenizer, labels, manifest)

The run manifest records everything needed to reproduce the model: seed,
base model, dataset hash, hyper-parameters, library versions, git commit
and hardware. A GPU (e.g. Colab T4) is recommended; CPU works for the seed
dataset but is slow.
"""
import argparse
import hashlib
import json
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def dataset_hash(task: str) -> str:
    h = hashlib.sha256()
    for split in ("train", "valid", "test"):
        h.update((ROOT / "data" / f"{task}_{split}.jsonl").read_bytes())
    return h.hexdigest()[:16]


def git_commit() -> str | None:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    except Exception:
        return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--task", choices=["intent", "safety"], required=True)
    ap.add_argument("--version", required=True)
    ap.add_argument("--base-model", default="FacebookAI/xlm-roberta-base")
    ap.add_argument("--epochs", type=float, default=8)
    ap.add_argument("--lr", type=float, default=3e-5)
    ap.add_argument("--batch-size", type=int, default=16)
    ap.add_argument("--max-length", type=int, default=96)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    # Heavy imports after arg parsing so --help is instant.
    import numpy as np
    import torch
    import transformers
    from datasets import load_dataset
    import evaluate
    from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                              DataCollatorWithPadding, Trainer, TrainingArguments, set_seed)

    set_seed(args.seed)
    labels = json.loads((ROOT / "labels.json").read_text(encoding="utf-8"))[args.task]
    label2id = {l: i for i, l in enumerate(labels)}
    id2label = {i: l for l, i in label2id.items()}

    files = {s: str(ROOT / "data" / f"{args.task}_{s}.jsonl") for s in ("train", "valid", "test")}
    ds = load_dataset("json", data_files=files)
    tok = AutoTokenizer.from_pretrained(args.base_model)

    def encode(batch):
        enc = tok(batch["text"], truncation=True, max_length=args.max_length)
        enc["labels"] = [label2id[l] for l in batch["label"]]
        return enc

    ds = ds.map(encode, batched=True, remove_columns=["text", "label", "language"])
    model = AutoModelForSequenceClassification.from_pretrained(
        args.base_model, num_labels=len(labels), id2label=id2label, label2id=label2id)

    f1 = evaluate.load("f1")
    acc = evaluate.load("accuracy")

    def metrics(pred):
        logits, y = pred
        p = np.argmax(logits, axis=-1)
        return {"accuracy": acc.compute(predictions=p, references=y)["accuracy"],
                "macro_f1": f1.compute(predictions=p, references=y, average="macro")["f1"]}

    run_dir = ROOT / "runs" / f"{args.task}-{args.version}"
    training_args = TrainingArguments(
        output_dir=str(run_dir / "checkpoints"),
        learning_rate=args.lr,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="macro_f1",
        save_total_limit=1,
        weight_decay=0.01,
        warmup_ratio=0.1,
        seed=args.seed,
        report_to=[],
    )
    trainer = Trainer(model=model, args=training_args, train_dataset=ds["train"], eval_dataset=ds["valid"],
                      tokenizer=tok, data_collator=DataCollatorWithPadding(tok), compute_metrics=metrics)
    trainer.train()

    model_dir = run_dir / "model"
    trainer.save_model(str(model_dir))
    tok.save_pretrained(str(model_dir))
    (model_dir / "labels.json").write_text(json.dumps(labels, ensure_ascii=False, indent=2), encoding="utf-8")

    manifest = {
        "task": args.task,
        "version": args.version,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "baseModel": args.base_model,
        "datasetHash": dataset_hash(args.task),
        "gitCommit": git_commit(),
        "hyperparameters": {k: getattr(args, k) for k in ("epochs", "lr", "batch_size", "max_length", "seed")},
        "validation": trainer.evaluate(),
        "environment": {
            "python": sys.version.split()[0],
            "torch": torch.__version__,
            "transformers": transformers.__version__,
            "platform": platform.platform(),
            "device": "cuda:" + torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
        },
        "status": "STAGED",
    }
    (run_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Saved model to {model_dir}. Next: python ml/training/evaluate.py --run {run_dir.name}")


if __name__ == "__main__":
    main()
