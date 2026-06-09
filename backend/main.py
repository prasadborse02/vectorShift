import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React build in production
BUILD_DIR = Path(__file__).resolve().parent.parent / "frontend" / "build"


class PipelineData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


def is_dag(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
    """Check if the directed graph defined by edges is a DAG (has no cycles).

    Uses iterative DFS with three-color marking:
      - WHITE (0): unvisited
      - GRAY (1): currently in the DFS stack (being explored)
      - BLACK (2): fully explored

    A back-edge to a GRAY node means a cycle exists -> not a DAG.
    """
    WHITE, GRAY, BLACK = 0, 1, 2

    # Collect all node ids
    node_ids = {node["id"] for node in nodes}

    # Build adjacency list
    adj: Dict[str, List[str]] = defaultdict(list)
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        adj[src].append(tgt)
        # Ensure both endpoints are known
        node_ids.add(src)
        node_ids.add(tgt)

    color: Dict[str, int] = {nid: WHITE for nid in node_ids}

    for start in node_ids:
        if color[start] != WHITE:
            continue
        # Iterative DFS
        stack: List[tuple] = [(start, 0)]  # (node, index into adj[node])
        color[start] = GRAY
        while stack:
            node, idx = stack[-1]
            neighbors = adj[node]
            if idx < len(neighbors):
                stack[-1] = (node, idx + 1)
                neighbor = neighbors[idx]
                if color[neighbor] == GRAY:
                    return False  # cycle detected
                if color[neighbor] == WHITE:
                    color[neighbor] = GRAY
                    stack.append((neighbor, 0))
            else:
                color[node] = BLACK
                stack.pop()

    return True


@app.post('/pipelines/parse')
def parse_pipeline(data: PipelineData):
    num_nodes = len(data.nodes)
    num_edges = len(data.edges)
    dag = is_dag(data.nodes, data.edges)
    return {'num_nodes': num_nodes, 'num_edges': num_edges, 'is_dag': dag}


# Serve React static files in production
if BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(BUILD_DIR / "static")), name="static")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        file_path = BUILD_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(BUILD_DIR / "index.html"))
