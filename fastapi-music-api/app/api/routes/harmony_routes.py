from fastapi import APIRouter, HTTPException
from app.api.schemas import CircleOfFifthsResponse, FifthsDistanceResponse, note_to_str, str_to_note
from app.domain import get_circle_of_fifths, get_fifths_distance, get_fifths_neighbors

router = APIRouter(prefix="/harmony", tags=["harmony"]) 

# returns the 12 chromatic notes ordered by the circle of fifths
@router.get("/circle-of-fifths")
async def get_circle_fifths() -> CircleOfFifthsResponse:
    notes = [note_to_str(n) for n in get_circle_of_fifths()]

    return CircleOfFifthsResponse(notes=notes)

# returns the shortest distance in fifths steps between two notes
@router.get("/distance/{note_1}/{note_2}")
async def get_circle_fifths_distance(note_1: str, note_2: str) -> FifthsDistanceResponse:
    try:
        n1 = str_to_note(note_1)
        n2 = str_to_note(note_2)

        return FifthsDistanceResponse(
            note_1=note_to_str(n1),
            note_2=note_to_str(n2),
            distance=get_fifths_distance(n1, n2)
        )
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err))
    
# returns all notes within max_distance fifths steps from the given note
@router.get("/neighbors/{note}")
async def get_circle_fifths_neighbors(note: str, max_distance: int = 2) -> list[str]:
    try:
        n = str_to_note(note)
        neighbors = get_fifths_neighbors(n, max_distance)

        return [note_to_str(neigh) for neigh in neighbors]
        
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err))