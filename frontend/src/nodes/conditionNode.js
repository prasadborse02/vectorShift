// conditionNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const ConditionNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [condition, setCondition] = useState(data?.condition || '');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-true`, style: { top: '33%' } },
    { type: 'source', position: Position.Right, id: `${id}-false`, style: { top: '66%' } },
  ];

  return (
    <BaseNode id={id} title="Condition" handles={handles} nodeType="condition">
      <label>
        Condition:
        <input
          type="text"
          value={condition}
          onChange={(e) => { setCondition(e.target.value); updateNodeField(id, 'condition', e.target.value); }}
        />
      </label>
    </BaseNode>
  );
};
