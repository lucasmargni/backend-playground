from __future__ import annotations
from pydantic import BaseModel

class CircleOfFifthsResponse(BaseModel):
    notes: list[str]

class FifthsDistanceResponse(BaseModel):
    note_1: str
    note_2: str
    distance: int
