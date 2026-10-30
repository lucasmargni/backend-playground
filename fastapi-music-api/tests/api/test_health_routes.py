from fastapi.testclient import TestClient

def test_health_check(client: TestClient) -> None:
    response = client.get("/health")

    # Check correct output
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}