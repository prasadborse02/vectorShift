// noteNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const NoteNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || '');

  const handles = [];

  return (
    <BaseNode id={id} title="Note" handles={handles}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add notes here..."
        style={{ width: '100%', resize: 'vertical' }}
      />
    </BaseNode>
  );
};
