from fastapi.testclient import TestClient
import pytest
from typing import TypedDict

class FifthsDistanceJSON(TypedDict):
    note_1: str
    note_2: str
    distance: int

def test_get_circle_of_fifths(client: TestClient) -> None:
    response = client.get("/api/harmony/circle-of-fifths")

    # Check correct output
    assert response.status_code == 200
    assert response.json() == {
        "notes": ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"]
    }

@pytest.mark.parametrize(
    ("notes", "expected"),
    [
        (
            "C/G",
            {
                "note_1": "C",
                "note_2": "G",
                "distance": 1
            }
        ),
        (
            "C/F-sharp",
            {
                "note_1": "C",
                "note_2": "F#",
                "distance": 6
            }
        ),
        (
            "G/C",
            {
                "note_1": "G",
                "note_2": "C",
                "distance": 1
            }
        ),
    ],
)
def test_get_fifths_distance(client: TestClient, notes: str, expected: FifthsDistanceJSON) -> None:
    response = client.get(f"/api/harmony/distance/{notes}")

    # Check some test cases
    assert response.status_code == 200
    assert response.json() == expected

@pytest.mark.parametrize(
    ("query", "expected"),
    [
        ("C", ["A#", "D", "F", "G"]),
        ("C?max_distance=1", ["F", "G"]),
        ("C?max_distance=0", []),
    ],
)
def test_get_fifths_neighbors(client: TestClient, query: str, expected: list[str]) -> None:
    response = client.get(f"/api/harmony/neighbors/{query}")

    # Check some test cases
    assert response.status_code == 200
    assert sorted(response.json()) == expected

@pytest.mark.parametrize(
    "url_error",
    [
        "/api/harmony/distance/H/G",
        "/api/harmony/neighbors/H",
        "/api/harmony/neighbors/C?max_distance=abc",
    ],
)
def test_harmony_error(client: TestClient, url_error: str) -> None:
    response = client.get(url_error)

    # Check some test cases
    assert response.status_code == 422
