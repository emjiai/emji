// Conceptual components/reactflow/StepNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

const StepNode = ({ data }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '4px', padding: '10px', width: 350 }}>
       <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
       <div style={{
         background: '#3b82f6', // Blue bg for step number
         color: 'white',
         borderRadius: '50%',
         width: '28px',
         height: '28px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         fontSize: '0.9em',
         fontWeight: 'bold',
         marginRight: '12px',
         flexShrink: 0,
       }}>
         {data.step}
       </div>
       <div style={{ fontSize: '0.9em', color: '#1e3a8a' }}>
         <strong style={{ color: '#1e40af' }}>{data.title}</strong>
         <p style={{ margin: '3px 0 0' }}>{data.detail}</p>
       </div>
       <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};
export default StepNode;