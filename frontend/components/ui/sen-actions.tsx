'use client';

import React, { useState } from 'react';
import { ChevronRight, Play, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Action {
  id: string;
  title: string;
  description: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  targetSkill: string;
  imageUrl?: string;
  completed?: boolean;
}

interface SenActionsProps {
  speechData?: any;
}

const SenActions: React.FC<SenActionsProps> = ({ speechData }) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  // Sample actions for speech and language development
  const actionData: Action[] = [
    {
      id: 'action1',
      title: 'Sound Repetition Challenge',
      description: 'Practice repeating specific sounds in different word positions.',
      steps: [
        'Listen to the sound being targeted.',
        'Repeat the sound in isolation 5 times.',
        'Practice saying words with the sound at the beginning.',
        'Practice saying words with the sound in the middle.',
        'Practice saying words with the sound at the end.'
      ],
      difficulty: 'medium',
      targetSkill: 'Articulation',
      imageUrl: 'https://example.com/articulation-image.jpg'
    },
    {
      id: 'action2',
      title: 'Syllable Counting Game',
      description: 'Build phonological awareness by breaking words into syllables.',
      steps: [
        'Say a word clearly.',
        'Clap once for each syllable as you say it slowly.',
        'Count how many syllables are in the word.',
        'Try with longer words.',
        'Create a sentence using words with different numbers of syllables.'
      ],
      difficulty: 'easy',
      targetSkill: 'Phonological Awareness',
      imageUrl: 'https://example.com/syllable-image.jpg'
    },
    {
      id: 'action3',
      title: 'Describing Objects Challenge',
      description: 'Improve vocabulary and descriptive language skills.',
      steps: [
        'Choose an everyday object.',
        'Describe its appearance (color, shape, size).',
        'Describe how it feels (texture, weight).',
        'Try to use at least 5 descriptive words.'
      ],
      difficulty: 'medium',
      targetSkill: 'Expressive Language',
      imageUrl: 'https://example.com/describing-image.jpg'
    },
    {
      id: 'action4',
      title: 'Following Directions Sequence',
      description: 'Practice listening and following multi-step instructions.',
      steps: [
        'Listen carefully to a 2-3 step direction.',
        'Repeat the directions back.',
        'Complete the tasks in the correct order.',
        'Try with more complex directions.',
        'Create your own set of directions for someone else to follow.'
      ],
      difficulty: 'hard',
      targetSkill: 'Receptive Language',
      imageUrl: 'https://example.com/directions-image.jpg'
    },
    {
      id: 'action5',
      title: 'Storytelling Sequence',
      description: 'Practice narrative skills by telling a story with a beginning, middle, and end.',
      steps: [
        'Choose a simple topic or look at a picture.',
        'Think about what happens first, next, and last.',
        'Tell the story with a clear beginning.',
        'Include details in the middle of the story.',
        'Create an ending that makes sense.'
      ],
      difficulty: 'hard',
      targetSkill: 'Narrative Skills',
      imageUrl: 'https://example.com/storytelling-image.jpg'
    }
  ];

  const toggleAction = (actionId: string) => {
    setActiveAction(activeAction === actionId ? null : actionId);
  };

  const markAsCompleted = (actionId: string) => {
    if (completedActions.includes(actionId)) {
      setCompletedActions(completedActions.filter(id => id !== actionId));
    } else {
      setCompletedActions([...completedActions, actionId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4">Speech & Language Actions</h3>
      
      <div className="flex-grow overflow-auto">
        <div className="space-y-3">
          {actionData.map((action, index) => (
            <div 
              key={action.id}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <div 
                className={`p-3 cursor-pointer ${
                  completedActions.includes(action.id) ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
                onClick={() => toggleAction(action.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {completedActions.includes(action.id) && (
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-medium ${completedActions.includes(action.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(action.difficulty)}`}>
                          {action.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {action.targetSkill}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight 
                    size={18} 
                    className={`transform transition-transform ${
                      activeAction === action.id ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </div>
              </div>
              
              {activeAction === action.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t px-4 py-3"
                >
                  <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Play size={14} className="text-blue-500" />
                      Steps to Complete
                    </h5>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                      {action.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsCompleted(action.id);
                      }}
                      className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md ${
                        completedActions.includes(action.id)
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Award size={14} />
                      {completedActions.includes(action.id) ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {completedActions.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{completedActions.length}</span> of {actionData.length} actions completed
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(completedActions.length / actionData.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SenActions;