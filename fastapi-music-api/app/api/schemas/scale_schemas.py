from __future__ import annotations
from pydantic import BaseModel
from app.domain import Scale
from .helpers import note_to_str

class ScaleResponse(BaseModel):
    root: str
    scale_type: str
    notes: list[str]

    @classmethod
    def from_domain(cls, scale: Scale) -> ScaleResponse:
        return ScaleResponse(
            root=note_to_str(scale.root),
            scale_type=scale.scale_type.name.lower(),
            notes=[note_to_str(note) for note in scale.notes]
        )