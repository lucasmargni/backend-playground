import pytest
from app.domain import (Note, Scale, ScaleType, 
                        get_circle_of_fifths, get_fifths_distance, 
                        get_fifths_neighbors, find_shared_notes, build_scale)

def test_circle_of_fifths() -> None:
    # Check correct output
    assert get_circle_of_fifths() == (Note.C, Note.G, Note.D, Note.A, Note.E, Note.B, Note.F_SHARP,
                                      Note.C_SHARP, Note.G_SHARP, Note.D_SHARP, Note.A_SHARP, Note.F)

@pytest.mark.parametrize(
    ("note_1", "note_2", "expected"),
    [
        (Note.C, Note.C, 0),
        (Note.C, Note.G, 1),
        (Note.C, Note.F_SHARP, 6),
        (Note.C, Note.F, 1),
        (Note.G, Note.C, 1),
    ],
)
def test_fifths_distance(note_1: Note, note_2: Note, expected: int) -> None:
    # Check some test cases
    assert get_fifths_distance(note_1, note_2) == expected

@pytest.mark.parametrize(
    ("note", "max_distance", "expected"),
    [
        (Note.A, 1, (Note.D, Note.E)),
        (Note.A, 2, (Note.G, Note.D, Note.E, Note.B)),
        (Note.A, 100, (Note.C, Note.G, Note.D, Note.E, Note.B, Note.F_SHARP,
                        Note.C_SHARP, Note.G_SHARP, Note.D_SHARP, Note.A_SHARP, Note.F)),
        (Note.C, 2, (Note.A_SHARP, Note.F, Note.G, Note.D)),
        (Note.A, 0, ()),
    ],
)
def test_fifths_neighbors(note: Note, max_distance: int, expected: tuple[Note, ...]) -> None:
    # Check some test cases
    assert sorted(get_fifths_neighbors(note, max_distance)) == sorted(expected)

@pytest.mark.parametrize(
    ("scale_1", "scale_2", "expected"),
    [
        (
            build_scale(Note.C, ScaleType.MAJOR),
            build_scale(Note.C, ScaleType.MAJOR),
            (Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B)
        ),
        (
            build_scale(Note.C, ScaleType.MAJOR),
            build_scale(Note.G, ScaleType.MAJOR),
            (Note.C, Note.D, Note.E, Note.G, Note.A, Note.B)
        ),
        (
            build_scale(Note.C, ScaleType.MAJOR),
            build_scale(Note.F_SHARP, ScaleType.MAJOR),
            (Note.F, Note.B)
        ),
        (
            build_scale(Note.C, ScaleType.MAJOR),
            build_scale(Note.C, ScaleType.NATURAL_MINOR),
            (Note.C, Note.D, Note.F, Note.G)
        ),
        (
            build_scale(Note.C, ScaleType.MAJOR),
            build_scale(Note.A, ScaleType.NATURAL_MINOR),
            (Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B)
        ),
    ],
)
def test_shared_notes(scale_1: Scale, scale_2: Scale, expected: tuple[Note, ...]) -> None:
    # Check some test cases
    assert sorted(find_shared_notes(scale_1, scale_2)) == sorted(expected)