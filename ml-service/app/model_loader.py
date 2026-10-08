"""Loads fine-tuned classifiers from disk.

A model directory is the `model/` folder produced by ml/training/train.py
(config, weights, tokenizer, labels.json) plus the sibling manifest.json.
If a directory is missing or transformers/torch aren't installed, the
classifier reports itself as not loaded — the service never fabricates
predictions.
"""
from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path

log = logging.getLogger("guidia.ml")


@dataclass
class Classifier:
    role: str
    model_dir: Path | None
    loaded: bool = False
    version: str | None = None
    labels: list[str] = field(default_factory=list)
    error: str | None = None
    _tok: object = None
    _model: object = None

    def load(self) -> None:
        if not self.model_dir or not (self.model_dir / "config.json").exists():
            self.error = "model directory not found"
            return
        try:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer  # noqa: WPS433

            self._tok = AutoTokenizer.from_pretrained(self.model_dir)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.model_dir).eval()
            self.labels = json.loads((self.model_dir / "labels.json").read_text(encoding="utf-8"))
            manifest = self.model_dir.parent / "manifest.json"
            self.version = json.loads(manifest.read_text(encoding="utf-8")).get("version") if manifest.exists() else "unversioned"
            self.loaded = True
            log.info("loaded %s model %s from %s", self.role, self.version, self.model_dir)
        except Exception as exc:  # pragma: no cover - depends on local install
            self.error = f"{type(exc).__name__}"
            log.warning("could not load %s model: %s", self.role, exc)

    def predict(self, text: str) -> tuple[str, float]:
        import torch  # noqa: WPS433

        enc = self._tok(text, truncation=True, max_length=96, return_tensors="pt")
        with torch.no_grad():
            probs = torch.softmax(self._model(**enc).logits[0], dim=-1)
        idx = int(probs.argmax())
        return self.labels[idx], float(probs[idx])


def _dir(env_name: str) -> Path | None:
    value = os.environ.get(env_name)
    return Path(value) if value else None


intent = Classifier("intent", _dir("INTENT_MODEL_DIR"))
safety = Classifier("safety", _dir("SAFETY_MODEL_DIR"))


def load_all() -> None:
    intent.load()
    safety.load()
