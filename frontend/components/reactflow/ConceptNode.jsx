import React from 'react';
import { Handle, Position } from 'reactflow';
// Assumes you have lucide-react installed: npm install lucide-react
import { Database, Brain, MessageSquare, Sparkles, Mail, Lightbulb, Scroll, Image as ImageIcon } from 'lucide-react';

// Map icon names from data to actual components
const icons = {
  Database: Database,
  Brain: Brain,
  MessageSquare: MessageSquare,
  Sparkles: Sparkles,
  Mail: Mail,
  Lightbulb: Lightbulb,
  Scroll: Scroll,
  Image: ImageIcon,
  // Add more icons as needed
};


const ConceptNode = ({ data }) => {
  // Get the Icon component based on data.icon, default to null or a placeholder
  const IconComponent = icons[data.icon] || null;

  return (
    <div style={{
        background: 'white',
        border: '1px solid #e2e8f0', // Tailwind slate-200
        borderRadius: '6px',
        padding: '10px',
        fontSize: '0.85em',
        minHeight: '90px', // Ensure minimum height
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
       {/* Handles should be positioned correctly based on layout needs */}
       <Handle type="target" position={Position.Left} id="left" style={{ background: '#555' }} />
       <Handle type="target" position={Position.Top} id="top" style={{ background: '#555' }} />

      {IconComponent && <IconComponent size={24} style={{ marginBottom: '5px', color: '#475569' }} />} {/* Tailwind slate-600 */}
      <strong style={{ fontSize: '1em', marginBottom: '3px', color: '#1e293b' }}>{data.title}</strong>
      <p style={{ margin: 0, fontSize: '0.9em', color: '#475569', textAlign: 'center' }}>{data.description}</p>

      <Handle type="source" position={Position.Right} id="right" style={{ background: '#555' }} />
       <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#555' }} />
    </div>
  );
};

export default ConceptNode;