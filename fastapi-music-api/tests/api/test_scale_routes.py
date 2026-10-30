from fastapi.testclient import TestClient
import pytest
from typing import TypedDict

class ScaleJSON(TypedDict):
    root: str
    scale_type: str
    notes: list[str]

@pytest.mark.parametrize(
    ("scale", "expected"),
    [
        (
            "C/major",
            {
                "root": "C",
                "scale_type": "major",
                "notes": ["C", "D", "E", "F", "G", "A", "B"]
            }
        ),
        (
            "C-sharp/major",
            {
                "root": "C#",
                "scale_type": "major",
                "notes": ["C#", "D#", "F", "F#", "G#", "A#", "C"]
            }
        ),
        (
            "C%23/major", # C%23 encodes C#
            {
                "root": "C#",
                "scale_type": "major",
                "notes": ["C#", "D#", "F", "F#", "G#", "A#", "C"]
            }
        ),
    ],
)
def test_get_scale(client: TestClient, scale: str, expected: ScaleJSON) -> None:
    response = client.get(f"/api/scales/{scale}")

    # Check some test cases
    assert response.status_code == 200
    assert response.json() == expected

@pytest.mark.parametrize(
    ("note", "num_scales"),
    [
        ("C", 49),
        ("F-sharp", 49),
        ("C%23", 49),
    ],
)
def test_scales_containing(client: TestClient, note: str, num_scales: int) -> None:
    response = client.get(f"/api/scales/containing/{note}")

    # Check some test cases
    assert response.status_code == 200
    assert len(response.json()) == num_scales

@pytest.mark.parametrize(
    "scale_error",
    [
        "H/major",
        "C/unknown",
        "containing/H",
    ],
)
def test_scale_error(client: TestClient, scale_error: str) -> None:
    response = client.get(f"/api/scales/{scale_error}")

    # Check some test cases
    assert response.status_code == 422