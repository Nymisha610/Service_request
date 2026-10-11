"""Backend tests. Run from the backend/ folder with:  pytest"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_FILE", str(tmp_path / "requests.json"))
    from app import main

    main.store = main.RequestStore(main.get_data_file())
    return TestClient(main.app)


VALID = {
    "name": "Test User",
    "email": "Test.User@Example.com",
    "subject": "Broken badge reader",
    "description": "The badge reader at the main entrance rejects every badge.",
}


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_list_returns_seed_data(client):
    body = client.get("/api/requests").json()
    assert body["count"] == len(body["data"]) == 3
    assert body["data"][0]["id"] > body["data"][-1]["id"]


def test_create_and_list(client):
    res = client.post("/api/requests", json=VALID)
    assert res.status_code == 201
    created = res.json()["data"]
    assert created["email"] == "test.user@example.com"
    assert created["status"] == "open"
    assert client.get("/api/requests").json()["count"] == 4


def test_validation_errors_are_field_level(client):
    res = client.post("/api/requests", json={**VALID, "email": "nope", "name": "A"})
    assert res.status_code == 422
    fields = res.json()["error"]["fields"]
    assert set(fields) == {"email", "name"}


def test_missing_field_is_reported(client):
    payload = {k: v for k, v in VALID.items() if k != "description"}
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422
    assert "description" in res.json()["error"]["fields"]


def test_control_characters_are_stripped(client):
    res = client.post("/api/requests", json={**VALID, "subject": "Hello\x00 world"})
    assert res.json()["data"]["subject"] == "Hello world"


def test_unknown_route_uses_error_format(client):
    res = client.get("/api/nope")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "not_found"


def test_cors_allows_configured_origin(client):
    res = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
    res = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in res.headers
