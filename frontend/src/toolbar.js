// toolbar.js

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {

    return (
        <div className="pipeline-toolbar">
            <div className="pipeline-toolbar__items">
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <DraggableNode type='api' label='API' />
                <DraggableNode type='condition' label='Condition' />
                <DraggableNode type='timer' label='Timer' />
                <DraggableNode type='note' label='Note' />
                <DraggableNode type='transform' label='Transform' />
            </div>
        </div>
    );
};
