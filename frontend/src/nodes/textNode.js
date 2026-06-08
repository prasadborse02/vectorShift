// textNode.js

import { useState, useMemo } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  // Parse variables from {{ variableName }} patterns
  const variables = useMemo(() => {
    const regex = /\{\{\s*([^}]*?)\s*\}\}/g;
    const vars = [];
    const seen = new Set();
    let match;
    while ((match = regex.exec(currText)) !== null) {
      const varName = match[1].trim();
      // Validate as a valid JS variable name
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName) && !seen.has(varName)) {
        seen.add(varName);
        vars.push(varName);
      }
    }
    return vars;
  }, [currText]);

  // Compute dynamic size based on text content
  const nodeStyle = useMemo(() => {
    const lines = currText.split('\n');
    const longestLine = Math.max(...lines.map((line) => line.length));
    const numLines = lines.length;

    // Grow width based on longest line (approx 8px per char + padding)
    const width = Math.max(200, Math.min(longestLine * 8 + 40, 500));
    // Grow height based on number of lines (approx 20px per line + padding for title/label)
    const height = Math.max(80, numLines * 20 + 60);

    return { width, height };
  }, [currText]);

  // Build handles: variable target handles on left + source handle on right
  const handles = useMemo(() => {
    const variableHandles = variables.map((varName, index) => ({
      type: 'target',
      position: Position.Left,
      id: `${id}-${varName}`,
      style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
    }));

    return [
      ...variableHandles,
      { type: 'source', position: Position.Right, id: `${id}-output` },
    ];
  }, [id, variables]);

  return (
    <BaseNode id={id} title="Text" handles={handles} style={nodeStyle}>
      <label>
        Text:
        <textarea
          value={currText}
          onChange={handleTextChange}
          style={{ width: '100%', resize: 'none' }}
        />
      </label>
    </BaseNode>
  );
}
