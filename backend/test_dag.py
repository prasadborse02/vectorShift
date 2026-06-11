"""Tests for the DAG detection algorithm and /pipelines/parse endpoint."""

import pytest
from fastapi.testclient import TestClient
from main import app, is_dag


# --- Unit tests for is_dag ---

def test_empty_graph():
    assert is_dag([], []) is True

def test_single_node():
    assert is_dag([{"id": "a"}], []) is True

def test_linear_chain():
    nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}]
    edges = [{"source": "a", "target": "b"}, {"source": "b", "target": "c"}]
    assert is_dag(nodes, edges) is True

def test_simple_cycle():
    nodes = [{"id": "a"}, {"id": "b"}]
    edges = [{"source": "a", "target": "b"}, {"source": "b", "target": "a"}]
    assert is_dag(nodes, edges) is False

def test_three_node_cycle():
    nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}]
    edges = [
        {"source": "a", "target": "b"},
        {"source": "b", "target": "c"},
        {"source": "c", "target": "a"},
    ]
    assert is_dag(nodes, edges) is False

def test_diamond_graph():
    nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}]
    edges = [
        {"source": "a", "target": "b"},
        {"source": "a", "target": "c"},
        {"source": "b", "target": "d"},
        {"source": "c", "target": "d"},
    ]
    assert is_dag(nodes, edges) is True

def test_disconnected_components():
    nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}]
    edges = [{"source": "a", "target": "b"}, {"source": "c", "target": "d"}]
    assert is_dag(nodes, edges) is True

def test_self_loop():
    nodes = [{"id": "a"}]
    edges = [{"source": "a", "target": "a"}]
    assert is_dag(nodes, edges) is False

def test_cycle_in_one_component_valid_other():
    nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}]
    edges = [
        {"source": "a", "target": "b"},
        {"source": "b", "target": "a"},
        {"source": "c", "target": "d"},
    ]
    assert is_dag(nodes, edges) is False


# --- Integration tests for /pipelines/parse ---

client = TestClient(app)

def test_parse_empty_pipeline():
    response = client.post("/pipelines/parse", json={"nodes": [], "edges": []})
    assert response.status_code == 200
    data = response.json()
    assert data == {"num_nodes": 0, "num_edges": 0, "is_dag": True}

def test_parse_simple_pipeline():
    response = client.post("/pipelines/parse", json={
        "nodes": [{"id": "a"}, {"id": "b"}],
        "edges": [{"source": "a", "target": "b"}],
    })
    assert response.status_code == 200
    data = response.json()
    assert data["num_nodes"] == 2
    assert data["num_edges"] == 1
    assert data["is_dag"] is True

def test_parse_cyclic_pipeline():
    response = client.post("/pipelines/parse", json={
        "nodes": [{"id": "a"}, {"id": "b"}],
        "edges": [
            {"source": "a", "target": "b"},
            {"source": "b", "target": "a"},
        ],
    })
    data = response.json()
    assert data["is_dag"] is False
