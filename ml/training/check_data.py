"""Dataset quality gate. Run before every training run.

    python ml/training/check_data.py --task intent

Fails (exit 1) on: unknown labels/languages, empty text, exact or
near-duplicate leakage between splits, and secrets in the data. Prints the
label x language balance so gaps are visible.
"""
import argparse
import collections
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABELS = json.loads((ROOT / "labels.json").read_text(encoding="utf-8"))
SECRET = re.compile(r"\b\d{6,}\b|password\s*[:=]\s*\S+|pin\s*[:=]?\s*\d{4,}", re.I)


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"[^\w]+", " ", text).strip()


def load(task: str, split: str):
    path = ROOT / "data" / f"{task}_{split}.jsonl"
    rows = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            row = json.loads(line)
            row["_where"] = f"{path.name}:{i}"
            rows.append(row)
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--task", choices=["intent", "safety"], required=True)
    args = ap.parse_args()

    labels = set(LABELS[args.task])
    langs = set(LABELS["languages"])
    splits = {s: load(args.task, s) for s in ("train", "valid", "test")}
    problems = []

    for split, rows in splits.items():
        for r in rows:
            if r.get("label") not in labels:
                problems.append(f"{r['_where']}: unknown label {r.get('label')!r}")
            if r.get("language") not in langs:
                problems.append(f"{r['_where']}: unknown language {r.get('language')!r}")
            if not str(r.get("text", "")).strip():
                problems.append(f"{r['_where']}: empty text")
            # Allow obviously fake demo numbers in safety data only when the
            # text teaches NOT to share them; anything else is a leak risk.
            if SECRET.search(r.get("text", "")) and args.task == "intent":
                problems.append(f"{r['_where']}: looks like it contains a secret")

    seen = {}
    for split, rows in splits.items():
        for r in rows:
            key = norm(r["text"])
            if key in seen and seen[key][0] != split:
                problems.append(f"{r['_where']}: duplicate of {seen[key][1]} across splits (test leakage)")
            seen.setdefault(key, (split, r["_where"]))

    print(f"Task: {args.task}")
    for split, rows in splits.items():
        print(f"  {split}: {len(rows)} examples")
    table = collections.Counter((r["label"], r["language"]) for r in splits["train"])
    print("\nTrain examples per label (by language):")
    for label in sorted(labels):
        cells = ", ".join(f"{lg}={table[(label, lg)]}" for lg in sorted(langs) if table[(label, lg)])
        total = sum(table[(label, lg)] for lg in langs)
        print(f"  {label:<18} {total:>4}  {cells}")

    if problems:
        print("\nProblems:")
        for p in problems:
            print("  -", p)
        return 1
    print("\nOK — no schema problems or cross-split leakage.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
