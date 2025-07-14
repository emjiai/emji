// Conceptual components/reactflow/AudioPromptNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Volume2, MessageCircle } from 'lucide-react'; // Example icons

const AudioPromptNode = ({ data }) => {
  const isPrompt = data.type === 'prompt'; // Example data field to differentiate
  const Icon = isPrompt ? MessageCircle : Volume2;

  return (
    <div style={{ padding: '15px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', width: 250 }}>
       <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
         <Icon size={20} style={{ marginRight: '8px', color: '#ca8a04' }} />
         <strong style={{ color: '#713f12' }}>{data.title}</strong>
       </div>
       <p style={{ margin: 0, fontSize: '0.9em', color: '#854d0e' }}>{data.text}</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default AudioPromptNode;