// Conceptual components/reactflow/ExerciseNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Edit3 } from 'lucide-react'; // Example icon

const ExerciseNode = ({ data }) => {
  return (
    <div style={{ padding: '15px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px', width: 280 }}>
       <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
         <Edit3 size={18} style={{ marginRight: '8px', color: '#047857' }} />
         <strong style={{ color: '#065f46' }}>{data.title || 'Try This:'}</strong>
       </div>
       <p style={{ margin: '0 0 10px', fontSize: '0.9em', color: '#065f46' }}>{data.prompt}</p>
       {/* Example: Placeholder for interaction */}
       <button style={{ fontSize: '0.8em', padding: '4px 8px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '4px', cursor: 'pointer' }}>
         {data.buttonText || 'Reveal Hint'}
       </button>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};
export default ExerciseNode;