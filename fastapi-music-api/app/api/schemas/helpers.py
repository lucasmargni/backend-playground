from app.domain import Note

def note_to_str(note: Note) -> str:
    return note.name.replace("_SHARP", "#")

def str_to_note(value: str) -> Note:
    normalized = value.upper().replace("#", "_SHARP")
    try:
        return Note[normalized]
    except KeyError:
        raise ValueError(f"Invalid note: '{value}'")