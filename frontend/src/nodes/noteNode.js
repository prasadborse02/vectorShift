// noteNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [text, setText] = useState(data?.text || '');

  const handles = [];

  return (
    <BaseNode id={id} title="Note" handles={handles} nodeType="note">
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); updateNodeField(id, 'text', e.target.value); }}
        placeholder="Add notes here..."
        style={{ width: '100%', resize: 'vertical' }}
      />
    </BaseNode>
  );
};
