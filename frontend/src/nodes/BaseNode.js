// BaseNode.js

import { Handle } from 'reactflow';

export const BaseNode = ({ id, title, handles, children }) => {
  return (
    <div style={{ width: 200, height: 80, border: '1px solid black' }}>
      {handles
        .filter((h) => h.type === 'target')
        .map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            style={handle.style}
          />
        ))}
      <div>
        <span>{title}</span>
      </div>
      <div>{children}</div>
      {handles
        .filter((h) => h.type === 'source')
        .map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            style={handle.style}
          />
        ))}
    </div>
  );
};
