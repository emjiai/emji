'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, Zap, Award, RotateCcw } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

interface SenGamesProps {
  speechData?: any;
}

const SenGames: React.FC<SenGamesProps> = ({ speechData }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [wordPairsCompleted, setWordPairsCompleted] = useState<string[]>([]);
  const [activeGameStep, setActiveGameStep] = useState<number>(0);
  
  // Sample games for speech and language development
  const games: Game[] = [
    {
      id: 'minimal-pairs',
      title: 'Minimal Pairs Challenge',
      description: 'Practice distinguishing between similar-sounding words that differ by only one sound.',
      targetSkill: 'Auditory Discrimination',
      difficulty: 'medium',
      imageUrl: 'https://example.com/minimal-pairs.jpg'
    },
    {
      id: 'rhyming-game',
      title: 'Rhyme Time',
      description: 'Identify and create rhyming words to build phonological awareness.',
      targetSkill: 'Phonological Awareness',
      difficulty: 'easy',
      imageUrl: 'https://example.com/rhyming.jpg'
    },
    {
      id: 'category-sort',
      title: 'Category Sorting',
      description: 'Organize words into categories to strengthen vocabulary and semantic networks.',
      targetSkill: 'Vocabulary',
      difficulty: 'medium',
      imageUrl: 'https://example.com/category-sort.jpg'
    },
    {
      id: 'sequence-story',
      title: 'Sequence the Story',
      description: 'Arrange picture cards in the correct order to tell a story.',
      targetSkill: 'Narrative Skills',
      difficulty: 'hard',
      imageUrl: 'https://example.com/sequence-story.jpg'
    }
  ];

  // Sample data for the Minimal Pairs game
  const minimalPairsData = {
    title: 'Minimal Pairs Challenge',
    instructions: 'Listen carefully to the words. They sound similar but have one different sound. Choose the picture that matches the word you hear.',
    wordPairs: [
      { 
        id: 'pair1', 
        word1: { text: 'cat', image: 'https://example.com/cat.jpg', audio: '/audio/cat.mp3' },
        word2: { text: 'hat', image: 'https://example.com/hat.jpg', audio: '/audio/hat.mp3' }
      },
      { 
        id: 'pair2', 
        word1: { text: 'ship', image: 'https://example.com/ship.jpg', audio: '/audio/ship.mp3' },
        word2: { text: 'chip', image: 'https://example.com/chip.jpg', audio: '/audio/chip.mp3' }
      },
      { 
        id: 'pair3', 
        word1: { text: 'fish', image: 'https://example.com/fish.jpg', audio: '/audio/fish.mp3' },
        word2: { text: 'dish', image: 'https://example.com/dish.jpg', audio: '/audio/dish.mp3' }
      },
      { 
        id: 'pair4', 
        word1: { text: 'light', image: 'https://example.com/light.jpg', audio: '/audio/light.mp3' },
        word2: { text: 'right', image: 'https://example.com/right.jpg', audio: '/audio/right.mp3' }
      }
    ]
  };
  
  // Simplified rhyming game data
  const rhymingGameData = {
    title: 'Rhyme Time',
    instructions: 'For each word, find all the pictures that rhyme with it.',
    rounds: [
      {
        targetWord: 'cat',
        targetImage: 'https://example.com/cat.jpg',
        options: [
          { word: 'hat', image: 'https://example.com/hat.jpg', isRhyme: true },
          { word: 'bat', image: 'https://example.com/bat.jpg', isRhyme: true },
          { word: 'dog', image: 'https://example.com/dog.jpg', isRhyme: false },
          { word: 'mat', image: 'https://example.com/mat.jpg', isRhyme: true },
          { word: 'car', image: 'https://example.com/car.jpg', isRhyme: false },
          { word: 'rat', image: 'https://example.com/rat.jpg', isRhyme: true }
        ]
      }
    ]
  };

  const selectGame = (gameId: string) => {
    setSelectedGame(gameId);
    setGameScore(0);
    setWordPairsCompleted([]);
    setActiveGameStep(0);
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

  const handleWordPairCompletion = (pairId: string) => {
    if (!wordPairsCompleted.includes(pairId)) {
      setWordPairsCompleted([...wordPairsCompleted, pairId]);
      setGameScore(gameScore + 10);
    }
  };
  
  const playAudio = (url: string) => {
    // In a real implementation, this would play audio
    console.log(`Playing audio: ${url}`);
    // const audio = new Audio(url);
    // audio.play();
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameScore(0);
    setWordPairsCompleted([]);
    setActiveGameStep(0);
  };

  const renderGameList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {games.map(game => (
        <div 
          key={game.id}
          onClick={() => selectGame(game.id)}
          className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <h3 className="font-medium text-lg text-gray-900">{game.title}</h3>
          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(game.difficulty)}`}>
              {game.difficulty}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {game.targetSkill}
            </span>
          </div>
          <p className="text-sm text-gray-600">{game.description}</p>
        </div>
      ))}
    </div>
  );

  const renderMinimalPairsGame = () => {
    const currentPair = minimalPairsData.wordPairs[activeGameStep];
    const isCompleted = currentPair ? wordPairsCompleted.includes(currentPair.id) : false;
    const isLastStep = activeGameStep === minimalPairsData.wordPairs.length - 1;
    const isGameCompleted = minimalPairsData.wordPairs.length === wordPairsCompleted.length;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4 pb-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-gray-900">{minimalPairsData.title}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Score: {gameScore}
              </span>
              <button 
                onClick={resetGame}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Restart Game"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">{minimalPairsData.instructions}</p>
        </div>

        {isGameCompleted ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-blue-50 rounded-lg">
            <Award size={64} className="text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-4">You've completed the Minimal Pairs Challenge with a score of {gameScore}!</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Play Another Game
            </button>
          </div>
        ) : currentPair ? (
          <div className="flex-grow">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Pair {activeGameStep + 1} of {minimalPairsData.wordPairs.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${((activeGameStep + (isCompleted ? 1 : 0)) / minimalPairsData.wordPairs.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-4 border rounded-lg ${isCompleted ? 'opacity-50' : 'hover:border-blue-300 cursor-pointer'}`}>
                <div className="aspect-square bg-gray-100 mb-3 flex items-center justify-center">
                  {/* Image would go here */}
                  <div className="text-gray-400 text-5xl font-bold">{currentPair.word1.text}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{currentPair.word1.text}</span>
                  <button 
                    onClick={() => playAudio(currentPair.word1.audio)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={isCompleted}
                  >
                    <Volume2 size={18} className="text-blue-500" />
                  </button>
                </div>
              </div>
              
              <div className={`p-4 border rounded-lg ${isCompleted ? 'opacity-50' : 'hover:border-blue-300 cursor-pointer'}`}>
                <div className="aspect-square bg-gray-100 mb-3 flex items-center justify-center">
                  {/* Image would go here */}
                  <div className="text-gray-400 text-5xl font-bold">{currentPair.word2.text}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{currentPair.word2.text}</span>
                  <button 
                    onClick={() => playAudio(currentPair.word2.audio)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={isCompleted}
                  >
                    <Volume2 size={18} className="text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
            
            {!isCompleted ? (
              <div className="text-center mt-4">
                <button
                  onClick={() => handleWordPairCompletion(currentPair.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  I Can Tell The Difference!
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setActiveGameStep(isLastStep ? 0 : activeGameStep + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {isLastStep ? 'Start Over' : 'Next Pair'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderRhymingGame = () => {
    // Simplified implementation of the rhyming game
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4 pb-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-gray-900">{rhymingGameData.title}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Score: {gameScore}
              </span>
              <button 
                onClick={resetGame}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Restart Game"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">{rhymingGameData.instructions}</p>
        </div>
        
        <div className="flex-grow">
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Find words that rhyme with:</p>
            <div className="inline-block p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <div className="aspect-square w-24 h-24 bg-gray-100 mb-3 flex items-center justify-center mx-auto">
                {/* Target image would go here */}
                <div className="text-gray-400 text-5xl font-bold">{rhymingGameData.rounds[0].targetWord}</div>
              </div>
              <div className="font-bold text-lg">{rhymingGameData.rounds[0].targetWord}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {rhymingGameData.rounds[0].options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-3 border rounded-lg cursor-pointer hover:border-blue-300 text-center"
                onClick={() => {
                  if (option.isRhyme) {
                    setGameScore(gameScore + 5);
                  } else {
                    setGameScore(Math.max(0, gameScore - 2));
                  }
                }}
              >
                <div className="aspect-square bg-gray-100 mb-2 flex items-center justify-center">
                  {/* Image would go here */}
                  <div className="text-gray-400 text-3xl font-bold">{option.word}</div>
                </div>
                <div className="font-medium text-sm">{option.word}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderCategoryGame = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8">
        <Zap size={48} className="text-yellow-500 mb-4 mx-auto" />
        <h3 className="text-xl font-medium mb-2">Category Sorting Game</h3>
        <p className="text-gray-500">Coming soon! This game is under development.</p>
      </div>
    </div>
  );
  
  const renderSequenceGame = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8">
        <Zap size={48} className="text-yellow-500 mb-4 mx-auto" />
        <h3 className="text-xl font-medium mb-2">Sequence the Story Game</h3>
        <p className="text-gray-500">Coming soon! This game is under development.</p>
      </div>
    </div>
  );

  const renderSelectedGame = () => {
    switch (selectedGame) {
      case 'minimal-pairs':
        return renderMinimalPairsGame();
      case 'rhyming-game':
        return renderRhymingGame();
      case 'category-sort':
        return renderCategoryGame();
      case 'sequence-story':
        return renderSequenceGame();
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!selectedGame ? (
        <>
          <h3 className="text-lg font-medium mb-4">Speech & Language Games</h3>
          <div className="flex-grow overflow-auto">
            {renderGameList()}
          </div>
        </>
      ) : (
        <div className="flex-grow overflow-auto">
          {renderSelectedGame()}
        </div>
      )}
    </div>
  );
};

export default SenGames;