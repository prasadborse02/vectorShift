// timerNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const TimerNode = ({ id, data }) => {
  const [delay, setDelay] = useState(data?.delay || 1);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-trigger` },
    { type: 'source', position: Position.Right, id: `${id}-output` },
  ];

  return (
    <BaseNode id={id} title="Timer" handles={handles} nodeType="timer">
      <label>
        Delay (s):
        <input
          type="number"
          value={delay}
          min={0}
          onChange={(e) => setDelay(Number(e.target.value))}
        />
      </label>
    </BaseNode>
  );
};
