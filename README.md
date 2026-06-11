# VectorShift Pipeline Builder

A visual pipeline builder for creating and analyzing node-based workflows. Built with React, ReactFlow, and FastAPI.

**Live demo:** [vectorshift-pipeline-2jbe.onrender.com](https://vectorshift-pipeline-2jbe.onrender.com)

## Architecture

```
frontend/src/
  App.js              — Root: theme state, layout
  ui.js               — ReactFlow canvas, drag-and-drop, image export
  store.js            — Zustand state (nodes, edges, connections)
  toolbar.js          — Floating left sidebar with draggable node types
  HamburgerMenu.js    — Top-left menu (Save Image, Submit Details)
  CanvasToolbar.js    — Top-right controls (color swatches, lightness, theme)
  PipelineModal.js    — In-app modal for pipeline analysis results
  nodes/
    BaseNode.js       — Reusable node abstraction (title, handles, children)
    inputNode.js      — Data input (name + type)
    outputNode.js     — Data output (name + type)
    llmNode.js        — LLM with system/prompt inputs
    textNode.js       — Template text with {{ variable }} detection
    apiNode.js        — HTTP API call (URL + method)
    conditionNode.js  — Conditional branching (true/false outputs)
    timerNode.js      — Delay node (seconds)
    noteNode.js       — Documentation (no connections)
    transformNode.js  — Data transform (JSON parse, uppercase, etc.)

backend/
  main.py             — FastAPI: pipeline parsing, DAG validation, static serving
  test_dag.py         — Pytest: 12 tests for DAG algorithm + API endpoint
```

## Key Design Decisions

- **BaseNode abstraction**: All nodes share a common component that handles handles, title, and styling via config. Creating a new node is ~20 lines.
- **Text node variables**: Regex parses `{{ varName }}` patterns, validates as JS identifiers, and dynamically creates input handles.
- **DAG detection**: Iterative DFS with three-color marking (avoids recursion limits on large graphs).
- **State management**: Zustand for lightweight global state. Node field changes sync to store via `updateNodeField`.
- **Single-service deployment**: FastAPI serves the React build in production. Relative API URLs, no CORS issues.

## Running Locally

**Frontend:**
```bash
cd frontend
npm install
npm start        # http://localhost:3000
```

**Backend:**
```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload   # http://localhost:8000
```

The frontend's `proxy` setting in `package.json` routes API calls to the backend during development.

**Tests:**
```bash
cd backend
pip install pytest httpx
pytest test_dag.py -v
```

## Deployment

Uses Docker multi-stage build (Node for frontend, Python for backend). Deployed on Render free tier.

```bash
docker build -t vectorshift .
docker run -p 10000:10000 vectorshift
```
