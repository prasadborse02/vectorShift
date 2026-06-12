// ui.js

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
import { HamburgerMenu } from './HamburgerMenu';
import { CanvasToolbar } from './CanvasToolbar';
import { PipelineModal } from './PipelineModal';

import { SmartStepEdge } from '@tisoap/react-flow-smart-edge';

import 'reactflow/dist/style.css';

const gridSize = 20;
const edgeTypes = {
  smart: SmartStepEdge,
};
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
      return { id: nodeID, nodeType: `${type}` };
    };

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            addNode({ id: nodeID, type, position, data: getInitNodeData(nodeID, type) });
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleInteractiveChange = useCallback((interactive) => {
        setIsLocked(!interactive);
    }, []);

    const handleSaveImage = useCallback(() => {
        if (!reactFlowInstance) return;
        const flowEl = document.querySelector('.react-flow');
        if (!flowEl) return;

        const svgEls = flowEl.querySelectorAll('.react-flow__edge-path, .react-flow__connection-path');
        svgEls.forEach((el) => {
            const computed = window.getComputedStyle(el);
            el.setAttribute('stroke', computed.stroke);
            el.setAttribute('stroke-width', computed.strokeWidth);
        });

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
            <HamburgerMenu onSaveImage={handleSaveImage} onSubmitDetails={handleSubmitDetails} />
            <CanvasToolbar
                theme={theme}
                toggleTheme={toggleTheme}
                canvasBg={canvasBg}
                setCanvasBg={setCanvasBg}
                canvasLightness={canvasLightness}
                setCanvasLightness={setCanvasLightness}
            />
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
                edgeTypes={edgeTypes}
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
                <Controls className="controls-topright" onInteractiveChange={handleInteractiveChange} />
                <MiniMap />
            </ReactFlow>
        </div>
        <PipelineModal modal={modal} onClose={() => setModal(null)} />
        </>
    );
};
