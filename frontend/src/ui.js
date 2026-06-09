// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { ApiNode } from './nodes/apiNode';
import { ConditionNode } from './nodes/conditionNode';
import { TimerNode } from './nodes/timerNode';
import { NoteNode } from './nodes/noteNode';
import { TransformNode } from './nodes/transformNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  api: ApiNode,
  condition: ConditionNode,
  timer: TimerNode,
  note: NoteNode,
  transform: TransformNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});


export const PipelineUI = ({ theme, toggleTheme, canvasBg, setCanvasBg }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [canvasLightness, setCanvasLightness] = useState(0);
    const [modal, setModal] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();

          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };

            addNode(newNode);
          }
        },
        [reactFlowInstance]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleInteractiveChange = useCallback((interactive) => {
        setIsLocked(!interactive);
    }, []);

    const handleSaveImage = useCallback(() => {
        setMenuOpen(false);
        if (!reactFlowInstance) return;

        const flowEl = document.querySelector('.react-flow');
        if (!flowEl) return;

        // Inline all edge/marker styles so html-to-image can capture them
        const svgEls = flowEl.querySelectorAll('.react-flow__edge-path, .react-flow__connection-path');
        svgEls.forEach((el) => {
            const computed = window.getComputedStyle(el);
            el.setAttribute('stroke', computed.stroke);
            el.setAttribute('stroke-width', computed.strokeWidth);
        });

        // Clone marker defs into every SVG so they survive capture
        const markerDefs = flowEl.querySelector('svg defs');
        if (markerDefs) {
            flowEl.querySelectorAll('.react-flow__edges > svg').forEach((svg) => {
                if (!svg.querySelector('defs')) {
                    svg.insertBefore(markerDefs.cloneNode(true), svg.firstChild);
                }
            });
        }

        import('html-to-image').then(({ toJpeg }) => {
            toJpeg(flowEl, {
                quality: 0.95,
                backgroundColor: canvasBg,
                pixelRatio: 2,
                filter: (node) => {
                    // Exclude minimap and controls from the export
                    const cls = node?.classList;
                    if (!cls) return true;
                    return !cls.contains('react-flow__minimap') &&
                           !cls.contains('react-flow__controls') &&
                           !cls.contains('canvas-topbar') &&
                           !cls.contains('menu-container');
                },
            }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'pipeline.jpg';
                link.href = dataUrl;
                link.click();
            });
        }).catch(() => {
            const data = JSON.stringify(reactFlowInstance.toObject(), null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'pipeline.json';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }, [reactFlowInstance, canvasBg]);

    const handleSubmitDetails = useCallback(async () => {
        setMenuOpen(false);
        try {
            const response = await fetch('/pipelines/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            setModal({
                title: 'Pipeline Analysis',
                type: 'success',
                items: [
                    { label: 'Nodes', value: data.num_nodes },
                    { label: 'Edges', value: data.num_edges },
                    { label: 'Is DAG', value: data.is_dag ? 'Yes' : 'No' },
                ],
            });
        } catch (error) {
            setModal({
                title: 'Error',
                type: 'error',
                items: [{ label: 'Details', value: error.message }],
            });
        }
    }, [nodes, edges]);

    return (
        <>
        <div ref={reactFlowWrapper} className="reactflow-wrapper">
            {/* Top-left hamburger menu */}
            <div className="menu-container">
                <button
                    className="menu-hamburger"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Menu"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                {menuOpen && (
                    <>
                        <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                        <div className="menu-dropdown">
                            <button className="menu-item" onClick={handleSaveImage}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                </svg>
                                Save Image
                            </button>
                            <button className="menu-item" onClick={handleSubmitDetails}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                                Submit Details
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Top-right toolbar */}
            <div className="canvas-topbar">
                {/* Color swatches */}
                <div className="canvas-swatches">
                    {[
                        { color: '#e8b4b8', label: 'Rose' },
                        { color: '#f5e6ca', label: 'Sand' },
                        { color: '#b8d8be', label: 'Sage' },
                        { color: '#b4c8e8', label: 'Sky' },
                        { color: '#2a2b3d', label: 'Night' },
                    ].map((swatch) => (
                        <button
                            key={swatch.color}
                            className={`canvas-swatch${canvasBg === swatch.color ? ' canvas-swatch--active' : ''}`}
                            style={{ backgroundColor: swatch.color }}
                            onClick={() => setCanvasBg(swatch.color)}
                            title={swatch.label}
                        />
                    ))}
                </div>

                {/* Lightness slider */}
                <div className="canvas-opacity">
                    <input
                        type="range"
                        min="0"
                        max="90"
                        value={canvasLightness}
                        onChange={(e) => setCanvasLightness(Number(e.target.value))}
                        className="opacity-slider"
                        title={`Lightness: ${canvasLightness}%`}
                    />
                </div>

                {/* Dark mode toggle */}
                <button
                    className="topbar-btn"
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                >
                    {theme === 'light' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                    )}
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                nodesDraggable={!isLocked}
                nodesConnectable={!isLocked}
                elementsSelectable={!isLocked}
            >
                <Background
                    color={theme === 'dark' ? '#444' : '#aaa'}
                    gap={gridSize}
                    style={{
                        backgroundColor: canvasLightness > 0
                            ? `color-mix(in srgb, ${canvasBg} ${100 - canvasLightness}%, white)`
                            : canvasBg
                    }}
                />
                <Controls
                    className="controls-topright"
                    onInteractiveChange={handleInteractiveChange}
                />
                <MiniMap />
            </ReactFlow>
        </div>

        {/* Result modal */}
        {modal && (
            <div className="modal-backdrop" onClick={() => setModal(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className={`modal-header modal-header--${modal.type}`}>
                        {modal.type === 'success' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        )}
                        <span>{modal.title}</span>
                    </div>
                    <div className="modal-body">
                        {modal.items.map((item) => (
                            <div key={item.label} className="modal-row">
                                <span className="modal-label">{item.label}</span>
                                <span className="modal-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <button className="modal-close" onClick={() => setModal(null)}>
                        OK
                    </button>
                </div>
            </div>
        )}
        </>
    )
}
