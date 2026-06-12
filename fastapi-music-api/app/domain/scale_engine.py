from itertools import product
from .models import Note, ScaleType, Scale

# Builds a scale from a root note and a scale type, returning all its notes
def build_scale(root: Note, scale_type: ScaleType) -> Scale:
    notes = [root.advance(interval) for interval in scale_type.value]

    return Scale(root, scale_type, notes)

# Returns all scales (across all roots and types) that contain the given note
def find_scales_containing(note: Note) -> list[Scale]:
    all_scales = [build_scale(root, scale_type) for root, scale_type in product(Note, ScaleType)]

    return [scale for scale in all_scales if note in scale.notes]

# Returns the 1-based degree of a note within a scale, or None if not present
def get_scale_degree(scale: Scale, note: Note) -> int | None:
    if note in scale.notes:
        return scale.notes.index(note) + 1
    
    return None