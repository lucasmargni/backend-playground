from fastapi import HTTPException
from app.api.schemas import str_to_note
from app.domain import ChordQuality, Chord, ScaleType, Scale, build_chord, build_scale

# constructs a scale domain object from raw string params
def construct_scale(note: str, scale_type: str) -> Scale:
    try:
        root = str_to_note(note)
        st = ScaleType[scale_type.upper()]

        return  build_scale(root, st)
    except(ValueError):
        raise HTTPException(status_code=422, detail=f"Invalid note '{note}'")
    except(KeyError):
        raise HTTPException(status_code=422, detail=f"Invalid scale type '{scale_type}'")

# constructs a chord domain object from raw string params
def construct_chord(note: str, quality: str) -> Chord:
    try:
        root = str_to_note(note)
        cq = ChordQuality[quality.upper()]

        return build_chord(root, cq)
    except(ValueError):
        raise HTTPException(status_code=422, detail=f"Invalid note '{note}'")
    except(KeyError):
        raise HTTPException(status_code=422, detail=f"Invalid quality '{quality}'")   