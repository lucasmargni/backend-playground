from .models import Note, Scale

# Returns the 12 notes ordered by the circle of fifths (each a perfect fifth apart)
def get_circle_of_fifths() -> list[Note]:
    return [Note.C.advance(7*i) for i in range(12)]

# Returns the shortest distance (in fifths steps) between two notes in the circle of fifths (0-6)
def get_fifths_distance(note_1: Note, note_2: Note) -> int:
    pos_1 = (note_1 * 7) % 12
    pos_2 = (note_2 * 7) % 12

    return min((pos_1 - pos_2) % 12, (pos_2 - pos_1) % 12)

# Returns all notes within a given distance from a note in the circle of fifths
def get_fifths_neighbors(note: Note, max_distance: int) -> list[Note]:
    return [n for n in Note if get_fifths_distance(note, n) <= max_distance]

# Returns the notes that two scales have in common
def find_shared_notes(scale_1: Scale, scale_2: Scale) -> list[Note]:
    return list(set(scale_1.notes) & set(scale_2.notes))