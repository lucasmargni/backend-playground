from fastapi import APIRouter, HTTPException
from app.api.schemas import ScaleResponse, str_to_note
from app.domain import find_scales_containing
from app.api.parsers import construct_scale

router = APIRouter(prefix="/scales", tags=["scales"])

# returns the notes of the scale for the given root note and scale type
@router.get("/{note}/{scale_type}")
async def get_scale(note: str, scale_type: str) -> ScaleResponse:
    scale = construct_scale(note, scale_type)

    return ScaleResponse.from_domain(scale)
    
# returns all scales (across all roots and types) that contain the given note
@router.get("/containing/{note}")
async def get_scales_containing(note: str) -> list[ScaleResponse]:
    try:
        n = str_to_note(note)
        scales = find_scales_containing(n)

        return [ScaleResponse.from_domain(s) for s in scales]
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err))