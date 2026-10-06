# ML (Hugging Face specialist models)

Grok does the reasoning. Two small multilingual classifiers do fast, cheap routing:

| Model | Labels | Used by |
|---|---|---|
| Intent | 19 labels (`ml/labels.json`): LEARN_APP … NAVIGATION, UNKNOWN | Orchestrator routing, task goals |
| Safety | SAFE, SUSPICIOUS, HIGH_RISK, CRITICAL | Scam checks. It can raise a rule verdict, never lower it. |

The base model is `FacebookAI/xlm-roberta-base`, which covers English, Bengali, Hindi and Vietnamese and handles romanised Bengali reasonably once fine-tuned.

## Dataset status — read this first

`ml/data/*.jsonl` is a **hand-written seed set**:

- Intent: 95 training examples (5 per label: en, bn, Banglish, hi, vi), 38 validation and 38 test.
- Safety: 24 training, 8 validation and 8 test examples. They deliberately include benign messages that mention OTPs and PINs, such as "never share your OTP".

This is enough to test the pipeline, not enough for a model you should trust. The target is about 100 natural examples per intent per language. **Do not pad it with near-duplicate machine paraphrases.** Collect real phrasing (speech-like, typos, code-switching, older-adult wording), review it, and keep the test split untouched. Until a trained model is evaluated and deployed, the backend uses its rule-based fallback and marks it `degraded`.

Each row looks like this:

```json
{"text": "bkash e taka pathabo kivabe", "label": "SEND_MONEY", "language": "bn-Latn"}
```

Never put passwords, PINs, OTPs, account numbers or real personal data in a dataset. No user conversation is ever used for training automatically. Feedback ("this warning seems wrong") goes to the audit log for human review, never straight into training.

## Workflow

```bash
python ml/training/check_data.py --task intent
```

This runs the quality gate: schema, labels, languages, cross-split leakage and secrets.

```bash
pip install torch transformers datasets evaluate accelerate scikit-learn sentencepiece
```

```bash
python ml/training/train.py --task intent --version 0.1.0
```

```bash
python ml/training/evaluate.py --run intent-0.1.0
```

Run the same three steps with `--task safety`. Use a GPU (Colab T4 or better) for real datasets.

`train.py` writes `ml/runs/<task>-<version>/` containing `model/` (weights, tokenizer, `labels.json`) and `manifest.json`. The manifest records the seed, base model, dataset hash, git commit, hyper-parameters, library versions, device and validation metrics. Its status is `STAGED`.

`evaluate.py` writes `evaluation.json` and `evaluation.md` with accuracy, macro precision, recall and F1, per-label F1, a confusion matrix and **F1 per language**. Report the per-language table, not just the average: a model that scores well overall but poorly on Bengali is not acceptable for Guidia.

## Promotion and rollback

1. Evaluate the candidate against the current active model on the same test split.
2. Register it in `ml_model_versions` (role, version, dataset version, git commit, model hash, metrics) as `STAGED`, then `ACTIVE`, and set the previous version to `RETIRED`.
3. Deploy by copying `ml/runs/<run>/` to the service's model volume and restarting it. To roll back, point the volume at the previous run.
4. Tune `INTENT_HIGH_CONFIDENCE_THRESHOLD` and `INTENT_LOW_CONFIDENCE_THRESHOLD` from validation results, not from guesses.

## Serving (`ml-service/`)

```bash
cd ml-service && pip install -r requirements.txt
```

```bash
INTENT_MODEL_DIR=../ml/runs/intent-0.1.0/model SAFETY_MODEL_DIR=../ml/runs/safety-0.1.0/model uvicorn app.main:app --port 8001
```

| Endpoint | Behaviour |
|---|---|
| `GET /health` | Loaded models and their versions |
| `POST /intent` / `POST /safety` | Returns `{model_loaded, intent or label, confidence, model_version}`. With no model it returns `model_loaded: false` and **no** confidence. |
| `POST /embedding` | 501 until an embedding model is configured |

Point the API at it with `ML_SERVICE_URL=http://localhost:8001`. The API calls it with a 3 s timeout (`ML_TIMEOUT_MS`).

Tests:

```bash
cd ml-service && pip install -r requirements-dev.txt && pytest
```

## Later

- Embeddings for retrieval (stored as JSON in SQLite, or a vector extension after moving to PostgreSQL), behind `FEATURE_RAG`.
- An optional SFT/LoRA tutor model, adopted only if a benchmark shows it beats Grok on Guidia's own tasks.
