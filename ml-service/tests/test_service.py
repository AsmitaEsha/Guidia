from fastapi.testclient import TestClient

from app import model_loader
from app.main import app


def test_health_reports_models_not_loaded_without_inventing_them():
    with TestClient(app) as client:
        body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["models"]["intent"]["loaded"] is False


def test_intent_without_model_returns_no_confidence():
    with TestClient(app) as client:
        body = client.post("/intent", json={"text": "আমি বিকাশে টাকা পাঠাতে চাই"}).json()
    assert body == {"model_loaded": False, "model_version": None, "intent": None, "label": None, "confidence": None}


def test_intent_with_model_uses_prediction(monkeypatch):
    c = model_loader.intent
    monkeypatch.setattr(c, "loaded", True)
    monkeypatch.setattr(c, "version", "test")
    monkeypatch.setattr(c, "predict", lambda text: ("SEND_MONEY", 0.91))
    with TestClient(app) as client:
        monkeypatch.setattr(c, "loaded", True)  # lifespan reload resets it
        body = client.post("/intent", json={"text": "send money"}).json()
    assert body["intent"] == "SEND_MONEY"
    assert body["confidence"] == 0.91


def test_rejects_empty_text():
    with TestClient(app) as client:
        assert client.post("/safety", json={"text": ""}).status_code == 422
