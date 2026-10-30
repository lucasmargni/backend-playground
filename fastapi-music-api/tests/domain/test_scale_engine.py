import pytest
from app.domain import (Note, ScaleType, build_scale,
                        find_scales_containing, get_scale_degree)

@pytest.mark.parametrize(
    ("root", "scale_type", "expected"),
    [
        (Note.C, ScaleType.MAJOR, (Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B)),
        (Note.A, ScaleType.MAJOR, (Note.A, Note.B, Note.C_SHARP, Note.D, Note.E,
                                   Note.F_SHARP, Note.G_SHARP)),
        (Note.C, ScaleType.NATURAL_MINOR, (Note.C, Note.D, Note.D_SHARP, Note.F, Note.G,
                                           Note.G_SHARP, Note.A_SHARP)),
    ],
)
def test_build_scale(root: Note, scale_type: ScaleType, expected: tuple[Note, ...]) -> None:
    # Check some test cases
    assert build_scale(root, scale_type).notes == expected

@pytest.mark.parametrize(
    "note",
    [
        Note.C,
        Note.E,
        Note.F_SHARP
    ]
)
def test_scales_containing(note: Note) -> None:
    scales = find_scales_containing(note)

    # Check some test cases
    assert len(scales) == 49
    assert all(note in scale.notes for scale in scales)

@pytest.mark.parametrize(
    ("note", "expected"),
    [
        (Note.C, 1),
        (Note.B, 7),
        (Note.C_SHARP, None),
    ],
)
def test_scale_degree(note: Note, expected: int | None) -> None:
    scale = build_scale(Note.C, ScaleType.MAJOR)

    # Check some test cases
    assert get_scale_degree(scale, note) == expected