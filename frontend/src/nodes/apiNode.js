// apiNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const ApiNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [url, setUrl] = useState(data?.url || '');
  const [method, setMethod] = useState(data?.method || 'GET');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-body` },
    { type: 'source', position: Position.Right, id: `${id}-response` },
  ];

  return (
    <BaseNode id={id} title="API" handles={handles} nodeType="api">
      <label>
        URL:
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); updateNodeField(id, 'url', e.target.value); }}
        />
      </label>
      <label>
        Method:
        <select value={method} onChange={(e) => { setMethod(e.target.value); updateNodeField(id, 'method', e.target.value); }}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
    </BaseNode>
  );
};
