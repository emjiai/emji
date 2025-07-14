import React from 'react';
import { Handle, Position } from 'reactflow';

// Simple placeholder for where a diagram would go
const DiagramPlaceholderNode = ({ data }) => {
  return (
    <div style={{
      padding: '10px',
      fontSize: '0.9em',
      color: '#075985' // Tailwind cyan-800
    }}>
       <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <strong>{data.label}</strong>
        <p style={{ margin: '5px 0 0', fontSize: '0.8em', color: '#0369a1' }}>{data.description}</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default DiagramPlaceholderNode;