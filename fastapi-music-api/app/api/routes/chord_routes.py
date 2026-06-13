from fastapi import APIRouter
from app.api.schemas import ChordResponse, note_to_str
from app.domain import get_chord_inversions, get_diatonic_chords
from app.api.parsers import construct_chord, construct_scale

router = APIRouter(prefix="/chords", tags=["chords"]) 

# returns the notes and structure of the chord for the given root and quality
@router.get("/{note}/{quality}")
async def get_chord(note: str, quality: str) -> ChordResponse:
    chord = construct_chord(note, quality)

    return ChordResponse.from_domain(chord)
    
# returns all voicings of the chord as lists of note strings
@router.get("/{note}/{quality}/inversions")
async def get_chords_inversions(note: str, quality: str) -> list[list[str]]:
    chord = construct_chord(note, quality)
    inversions = get_chord_inversions(chord)

    return  [[note_to_str(n) for n in inv] for inv in inversions]

# returns all diatonic triads for the scale defined by root note and scale type
@router.get("/diatonic/{note}/{scale_type}")
async def get_diatonic_chords_of_scale(note: str, scale_type: str) -> list[ChordResponse]:
    scale = construct_scale(note, scale_type)
    chords = get_diatonic_chords(scale)

    return [ChordResponse.from_domain(c) for c in chords]