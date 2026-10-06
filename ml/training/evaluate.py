"""Evaluate a trained run on the held-out test split.

    python ml/training/evaluate.py --run intent-0.1.0

Writes ml/runs/<run>/evaluation.json and evaluation.md with accuracy,
macro precision/recall/F1, per-label F1, a confusion matrix and — the
number that matters for Guidia — F1 per language. A model that is good on
average but poor in Bengali is not a successful Guidia model.
"""
import argparse
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True)
    ap.add_argument("--split", default="test")
    args = ap.parse_args()

    import torch
    from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    run_dir = ROOT / "runs" / args.run
    manifest = json.loads((run_dir / "manifest.json").read_text(encoding="utf-8"))
    model_dir = run_dir / "model"
    labels = json.loads((model_dir / "labels.json").read_text(encoding="utf-8"))
    tok = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir).eval()

    rows = [json.loads(l) for l in (ROOT / "data" / f"{manifest['task']}_{args.split}.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    preds = []
    with torch.no_grad():
        for i in range(0, len(rows), 32):
            batch = rows[i:i + 32]
            enc = tok([r["text"] for r in batch], truncation=True, max_length=96, padding=True, return_tensors="pt")
            preds.extend(model(**enc).logits.argmax(-1).tolist())

    y_true = [labels.index(r["label"]) for r in rows]
    p, r, f, _ = precision_recall_fscore_support(y_true, preds, average="macro", zero_division=0)
    per_label = f1_score(y_true, preds, average=None, labels=list(range(len(labels))), zero_division=0)

    by_lang = defaultdict(lambda: ([], []))
    for row, yt, yp in zip(rows, y_true, preds):
        by_lang[row["language"]][0].append(yt)
        by_lang[row["language"]][1].append(yp)
    lang_f1 = {lg: {"n": len(t), "macro_f1": round(f1_score(t, pp, average="macro", zero_division=0), 4)} for lg, (t, pp) in by_lang.items()}

    report = {
        "run": args.run,
        "split": args.split,
        "examples": len(rows),
        "accuracy": round(accuracy_score(y_true, preds), 4),
        "macro_precision": round(p, 4),
        "macro_recall": round(r, 4),
        "macro_f1": round(f, 4),
        "per_label_f1": {labels[i]: round(v, 4) for i, v in enumerate(per_label)},
        "per_language": lang_f1,
        "confusion_matrix": {"labels": labels, "matrix": confusion_matrix(y_true, preds, labels=list(range(len(labels)))).tolist()},
        "errors": [{"text": row["text"], "language": row["language"], "expected": row["label"], "predicted": labels[yp]}
                   for row, yt, yp in zip(rows, y_true, preds) if yt != yp][:50],
    }
    (run_dir / "evaluation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    md = [f"# Evaluation — {args.run} ({args.split})", "",
          f"Examples: {len(rows)} · Accuracy: {report['accuracy']} · Macro F1: {report['macro_f1']}", "",
          "| Language | n | Macro F1 |", "|---|---|---|"]
    md += [f"| {lg} | {v['n']} | {v['macro_f1']} |" for lg, v in sorted(lang_f1.items())]
    md += ["", "| Label | F1 |", "|---|---|"] + [f"| {k} | {v} |" for k, v in report["per_label_f1"].items()]
    if report["examples"] < 200:
        md += ["", "> Warning: the test split is small, so these numbers have wide error bars. Expand the dataset before trusting them."]
    (run_dir / "evaluation.md").write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md))


if __name__ == "__main__":
    main()
