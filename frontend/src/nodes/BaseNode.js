// BaseNode.js

import { Handle } from 'reactflow';

export const BaseNode = ({ id, title, handles, children, style, nodeType }) => {
  const typeClass = nodeType ? `base-node--${nodeType}` : '';
  return (
    <div className={`base-node ${typeClass}`} style={style}>
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
      <div className="base-node__header">
        <span>{title}</span>
      </div>
      <div className="base-node__body">{children}</div>
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
