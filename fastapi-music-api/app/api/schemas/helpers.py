from app.domain import Note

def note_to_str(note: Note) -> str:
    return note.name.replace("_SHARP", "#")