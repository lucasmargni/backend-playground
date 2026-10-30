from fastapi.testclient import TestClient
import pytest
from typing import TypedDict

class ChordJSON(TypedDict):
    root: str
    quality: str
    notes: list[str]

@pytest.mark.parametrize(
    ("chord", "expected"),
    [
        (
            "C/major",
            {
                "root": "C",
                "quality": "major",
                "notes": ["C", "E", "G"]
            }
        ),
        (
            "C-sharp/minor",
            {
                "root": "C#",
                "quality": "minor",
                "notes": ["C#", "E", "G#"]
            }
        ),
        (
            "G/dominant_seventh",
            {
                "root": "G",
                "quality": "dominant_seventh",
                "notes": ["G", "B", "D", "F"]
            }
        ),
    ],
)
def test_get_chord(client: TestClient, chord: str, expected: ChordJSON) -> None:
    response = client.get(f"/api/chords/{chord}")

    # Check some test cases
    assert response.status_code == 200
    assert response.json() == expected

@pytest.mark.parametrize(
    ("chord", "expected"),
    [
        ("C/major", [["C", "E", "G"], ["E", "G", "C"], ["G", "C", "E"]]),
        ("A/minor", [["A", "C", "E"], ["C", "E", "A"], ["E", "A", "C"]]),
        ("G/dominant_seventh", [["G", "B", "D", "F"], ["B", "D", "F", "G"],
                                ["D", "F", "G", "B"], ["F", "G", "B", "D"]]),
    ],
)
def test_get_chord_inversions(client: TestClient, chord: str, expected: list[list[str]]) -> None:
    response = client.get(f"/api/chords/{chord}/inversions")

    # Check some test cases
    assert response.status_code == 200
    assert response.json() == expected

@pytest.mark.parametrize(
    ("scale", "expected"),
    [
        ("C/major", ["major", "minor", "minor", "major", "major", "minor", "diminished"]),
        ("D/dorian", ["minor", "minor", "major", "major", "minor", "diminished", "major"]),
        ("A/harmonic_minor", ["minor", "diminished", "augmented", "minor",
                              "major", "major", "diminished"]),
    ],
)
def test_get_diatonic_chords(client: TestClient, scale: str, expected: list[str]) -> None:
    response = client.get(f"/api/chords/diatonic/{scale}")

    # Check some test cases
    assert response.status_code == 200
    assert [chord["quality"] for chord in response.json()] == expected

@pytest.mark.parametrize(
    "chord_error",
    [
        "H/major",
        "C/unknown",
        "diatonic/C/unknown",
    ],
)
def test_get_chord_error(client: TestClient, chord_error: str) -> None:
    response = client.get(f"/api/chords/{chord_error}")

    # Check some test cases
    assert response.status_code == 422
