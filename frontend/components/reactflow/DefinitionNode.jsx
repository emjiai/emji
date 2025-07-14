// Conceptual components/reactflow/DefinitionNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

const DefinitionNode = ({ data }) => {
  return (
    <div style={{ padding: '10px 15px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', width: 300 }}>
       <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
       <strong style={{ display: 'block', marginBottom: '5px', color: '#1f2937', fontSize: '1.05em' }}>{data.term}</strong>
       <p style={{ margin: 0, fontSize: '0.95em', color: '#374151' }}>{data.definition}</p>
       {data.keywords && (
         <p style={{ marginTop: '8px', fontSize: '0.8em', color: '#6b7280' }}>
           <em>Keywords: {data.keywords}</em>
         </p>
       )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};
export default DefinitionNode;