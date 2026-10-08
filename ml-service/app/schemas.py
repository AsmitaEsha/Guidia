from pydantic import BaseModel, Field


class TextIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class ClassificationOut(BaseModel):
    model_loaded: bool
    model_version: str | None = None
    # Present only when a real model produced them.
    intent: str | None = None
    label: str | None = None
    confidence: float | None = None
