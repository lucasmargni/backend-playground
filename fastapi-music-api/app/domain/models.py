from __future__ import annotations
from enum import Enum, IntEnum
from dataclasses import dataclass

class Note(IntEnum):
    C = 0
    C_SHARP = 1
    D = 2
    D_SHARP = 3
    E = 4
    F = 5
    F_SHARP = 6
    G = 7
    G_SHARP = 8
    A = 9
    A_SHARP = 10
    B = 11

    def advance(self, semitones: int) -> Note:
        return Note((self.value + semitones) % 12)
    
    def semitones_to(self, other: Note) -> int:
        return (other.value - self.value) % 12
    
class ScaleType(Enum):
    MAJOR = (0, 2, 4, 5, 7, 9, 11)
    NATURAL_MINOR = (0, 2, 3, 5, 7, 8, 10)
    HARMONIC_MINOR = (0, 2, 3, 5, 7, 8, 11)
    DORIAN = (0, 2, 3, 5, 7, 9, 10)
    PHRYGIAN = (0, 1, 3, 5, 7, 8, 10)
    LYDIAN = (0, 2, 4, 6, 7, 9, 11)
    MIXOLYDIAN = (0, 2, 4, 5, 7, 9, 10)

class ChordQuality(Enum):
    MAJOR = (0, 4, 7)
    MINOR = (0, 3, 7)
    DIMINISHED = (0, 3, 6)
    AUGMENTED = (0, 4, 8)
    MAJOR_SEVENTH = (0, 4, 7, 11)
    DOMINANT_SEVENTH = (0, 4, 7, 10)
    MINOR_SEVENTH = (0, 3, 7, 10)
    HALF_DIMINISHED = (0, 3, 6, 10)

@dataclass(frozen=True)
class Scale:
    root: Note
    scale_type: ScaleType
    notes: list[Note]

@dataclass(frozen=True)
class Chord:
    root: Note
    quality: ChordQuality
    notes: list[Note]