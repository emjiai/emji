'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PostItNote {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  type: 'insight' | 'action' | 'question' | 'key-point';
  position?: { x: number; y: number; rotate: number };
}

export interface PostItNotesData {
  title: string;
  description?: string;
  notes: PostItNote[];
}

const getIconForType = (type: PostItNote['type']) => {
  switch (type) {
    case 'insight':
      return <Lightbulb className="h-5 w-5" />;
    case 'key-point':
      return <Star className="h-5 w-5" />;
    case 'action':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'question':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

const getColorClasses = (color: PostItNote['color']) => {
  switch (color) {
    case 'yellow':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'blue':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'green':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'pink':
      return 'bg-pink-100 border-pink-300 text-pink-800';
    case 'purple':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    default:
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  }
};

const PostItNoteItem = ({ note }: { note: PostItNote }) => {
  // Default random position if not provided
  const position = note.position || {
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5,
    rotate: Math.random() * 6 - 3,
  };

  return (
    <motion.div
      className={`p-4 rounded-md shadow-md border border-opacity-50 ${getColorClasses(
        note.color
      )}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        transform: `rotate(${position.rotate}deg)`,
        marginLeft: `${position.x}px`,
        marginTop: `${position.y}px`,
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        rotate: 0
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {getIconForType(note.type)}
        <span className="font-medium capitalize">{note.type.replace('-', ' ')}</span>
      </div>
      <p className="whitespace-pre-line text-sm">{note.content}</p>
    </motion.div>
  );
};

export function PostItNotes({ data }: { data: PostItNotesData }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-2">{data.title}</h2>
      {data.description && <p className="text-gray-600 mb-6">{data.description}</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.notes.map((note) => (
          <PostItNoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}