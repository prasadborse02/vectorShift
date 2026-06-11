// transformNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TransformNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [transformType, setTransformType] = useState(data?.transformType || 'JSON Parse');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-output` },
  ];

  return (
    <BaseNode id={id} title="Transform" handles={handles} nodeType="transform">
      <label>
        Type:
        <select value={transformType} onChange={(e) => { setTransformType(e.target.value); updateNodeField(id, 'transformType', e.target.value); }}>
          <option value="JSON Parse">JSON Parse</option>
          <option value="Uppercase">Uppercase</option>
          <option value="Lowercase">Lowercase</option>
          <option value="Trim">Trim</option>
        </select>
      </label>
    </BaseNode>
  );
};
