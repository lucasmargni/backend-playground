from __future__ import annotations
from pydantic import BaseModel
from app.domain import Chord
from .helpers import note_to_str

class ChordResponse(BaseModel):
    root: str
    quality: str
    notes: list[str]

    @classmethod
    def from_domain(cls, chord: Chord) -> ChordResponse:
        return ChordResponse(
            root=note_to_str(chord.root),
            quality=chord.quality.name.lower(),
            notes=[note_to_str(note) for note in chord.notes]
        )