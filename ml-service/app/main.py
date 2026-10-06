"""Guidia ML service — Hugging Face specialist models behind a small API.

    GET  /health      which models are loaded (and their versions)
    POST /intent      {text} -> {model_loaded, intent, confidence, model_version}
    POST /safety      {text} -> {model_loaded, label, confidence, model_version}
    POST /embedding   reserved for retrieval (returns 501 until configured)

The Node API calls this with a short timeout and falls back to its own
deterministic rules when a model is unavailable. Input text is already
redacted by the API; this service logs no request bodies.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from . import model_loader
from .schemas import ClassificationOut, TextIn


@asynccontextmanager
async def lifespan(_app: FastAPI):
    model_loader.load_all()
    yield


app = FastAPI(title="Guidia ML service", version="0.1.0", lifespan=lifespan)


def _status(c: model_loader.Classifier) -> dict:
    return {"loaded": c.loaded, "version": c.version, "error": None if c.loaded else c.error}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "models": {"intent": _status(model_loader.intent), "safety": _status(model_loader.safety)}}


@app.post("/intent", response_model=ClassificationOut)
def intent(body: TextIn) -> ClassificationOut:
    c = model_loader.intent
    if not c.loaded:
        return ClassificationOut(model_loaded=False)
    label, confidence = c.predict(body.text)
    return ClassificationOut(model_loaded=True, model_version=c.version, intent=label, confidence=round(confidence, 4))


@app.post("/safety", response_model=ClassificationOut)
def safety(body: TextIn) -> ClassificationOut:
    c = model_loader.safety
    if not c.loaded:
        return ClassificationOut(model_loaded=False)
    label, confidence = c.predict(body.text)
    return ClassificationOut(model_loaded=True, model_version=c.version, label=label, confidence=round(confidence, 4))


@app.post("/embedding")
def embedding(_body: TextIn) -> dict:
    raise HTTPException(status_code=501, detail="Embedding model not configured yet; retrieval uses keyword search.")
