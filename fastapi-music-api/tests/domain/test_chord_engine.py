import pytest
from app.domain import (ChordQuality, Note, ScaleType, build_chord, build_scale,
                        get_chord_inversions, get_diatonic_chords)

@pytest.mark.parametrize(
    ("root", "quality", "expected"),
    [
        (Note.C, ChordQuality.MAJOR, (Note.C, Note.E, Note.G)),
        (Note.A, ChordQuality.MINOR, (Note.A, Note.C, Note.E)),
        (Note.G, ChordQuality.DOMINANT_SEVENTH, (Note.G, Note.B, Note.D, Note.F)),
    ],
)
def test_build_chord(root: Note, quality: ChordQuality, expected: tuple[Note, ...]) -> None:
    # Check some test cases
    assert build_chord(root, quality).notes == expected

@pytest.mark.parametrize(
    ("root", "scale_type", "expected"),
    [
        (Note.C, ScaleType.MAJOR, (
            ChordQuality.MAJOR, ChordQuality.MINOR, ChordQuality.MINOR, ChordQuality.MAJOR,
            ChordQuality.MAJOR, ChordQuality.MINOR, ChordQuality.DIMINISHED,
        )),
        (Note.D, ScaleType.DORIAN, (
            ChordQuality.MINOR, ChordQuality.MINOR, ChordQuality.MAJOR, ChordQuality.MAJOR,
            ChordQuality.MINOR, ChordQuality.DIMINISHED, ChordQuality.MAJOR,
        )),
        (Note.A, ScaleType.HARMONIC_MINOR, (
            ChordQuality.MINOR, ChordQuality.DIMINISHED, ChordQuality.AUGMENTED, ChordQuality.MINOR,
            ChordQuality.MAJOR, ChordQuality.MAJOR, ChordQuality.DIMINISHED,
        )),
    ],
)
def test_diatonic_chords(
    root: Note, scale_type: ScaleType, expected: tuple[ChordQuality, ...]
) -> None:
    scale = build_scale(root, scale_type)
    chords = get_diatonic_chords(scale)

    # Check some test cases
    assert tuple(chord.quality for chord in chords) == expected
    assert tuple(chord.root for chord in chords) == scale.notes

@pytest.mark.parametrize(
    ("root", "quality", "expected"),
    [
        (Note.C, ChordQuality.MAJOR, (
            (Note.C, Note.E, Note.G),
            (Note.E, Note.G, Note.C),
            (Note.G, Note.C, Note.E),
        )),
        (Note.A, ChordQuality.MINOR, (
            (Note.A, Note.C, Note.E),
            (Note.C, Note.E, Note.A),
            (Note.E, Note.A, Note.C),
        )),
        (Note.G, ChordQuality.DOMINANT_SEVENTH, (
            (Note.G, Note.B, Note.D, Note.F),
            (Note.B, Note.D, Note.F, Note.G),
            (Note.D, Note.F, Note.G, Note.B),
            (Note.F, Note.G, Note.B, Note.D),
        )),
    ],
)
def test_chord_inversions(
    root: Note, quality: ChordQuality, expected: tuple[tuple[Note, ...], ...]
) -> None:
    # Check some test cases
    assert get_chord_inversions(build_chord(root, quality)) == expected