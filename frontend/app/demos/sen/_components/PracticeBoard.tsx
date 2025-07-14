// PracticeBoard.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoDisplay from '@/components/ui/video-display';
import FlashCard from '@/components/ui/flash-card';
import ImageCarousel from '@/components/ui/Image-carousel';
import WhiteBoard from '@/components/ui/white-board';
import FullScreen from '@/components/ui/full-screen';
import ShapesGame from '@/components/ui/shapes-game';
import SenActions from '@/components/ui/sen-actions';
import SenGames from '@/components/ui/sen-games';

interface PracticeBoardProps {
  speechData: any;
}

const PracticeBoard: React.FC<PracticeBoardProps> = ({ speechData }) => {
  const [activeTab, setActiveTab] = useState('flash-cards');

  // Sample data for practice materials based on speech-data.json structure
  const practiceData = {
    videos: [
      {
        id: 'vid1',
        title: 'Articulation Practice: R and L Sounds',
        description: 'Watch and practice along with the video to improve your R and L sounds.',
        src: 'https://example.com/sample-articulation-video.mp4'
      },
      {
        id: 'vid2',
        title: 'Phonemic Awareness: Sound Blending',
        description: 'Learn how to blend sounds together to form words.',
        src: 'https://example.com/sample-phonemic-video.mp4'
      }
    ],
    flashCards: [
      {
        id: 'fc1',
        front: {
          title: 'Sound: /r/',
          content: 'How do you say the /r/ sound?',
          image: 'https://example.com/r-sound-image.jpg'
        },
        back: {
          title: 'Sound: /r/',
          content: 'The /r/ sound is made by curling your tongue back slightly and keeping it tense.',
          image: 'https://example.com/r-sound-position.jpg'
        }
      },
      {
        id: 'fc2',
        front: {
          title: 'Sound: /l/',
          content: 'How do you say the /l/ sound?',
          image: 'https://example.com/l-sound-image.jpg'
        },
        back: {
          title: 'Sound: /l/',
          content: 'The /l/ sound is made by placing the tip of your tongue behind your top front teeth.',
          image: 'https://example.com/l-sound-position.jpg'
        }
      },
      {
        id: 'fc3',
        front: {
          title: 'Word: "Lion"',
          content: 'Can you say the word "lion" clearly?',
          image: 'https://example.com/lion-image.jpg'
        },
        back: {
          title: 'Word: "Lion"',
          content: 'The word "lion" starts with the /l/ sound. Practice saying "lll-ion".',
          image: 'https://example.com/lion-image.jpg'
        }
      }
    ],
    images: [
      {
        src: 'https://example.com/articulation-chart-1.jpg',
        alt: 'Mouth position for R sound',
        caption: 'Correct mouth position for the R sound'
      },
      {
        src: 'https://example.com/articulation-chart-2.jpg',
        alt: 'Mouth position for L sound',
        caption: 'Correct mouth position for the L sound'
      },
      {
        src: 'https://example.com/words-with-r-sound.jpg',
        alt: 'Words with R sound',
        caption: 'Common words with the R sound'
      },
      {
        src: 'https://example.com/words-with-l-sound.jpg',
        alt: 'Words with L sound',
        caption: 'Common words with the L sound'
      }
    ]
  };

  const renderPracticeTools = () => (
    <div className="w-full h-full">
      <Tabs 
        defaultValue="flash-cards" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-2">
          <TabsList className="h-10">
            <TabsTrigger value="flash-cards" className="text-xs px-2 py-1">Flash Cards</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs px-2 py-1">Videos</TabsTrigger>
            <TabsTrigger value="images" className="text-xs px-2 py-1">Images</TabsTrigger>
            <TabsTrigger value="whiteboard" className="text-xs px-2 py-1">Whiteboard</TabsTrigger>
            <TabsTrigger value="shapes" className="text-xs px-2 py-1">Shapes</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs px-2 py-1">Actions</TabsTrigger>
            <TabsTrigger value="game" className="text-xs px-2 py-1">Game</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-grow overflow-auto">
          <TabsContent value="flash-cards" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <FlashCard cards={practiceData.flashCards} />
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              {practiceData.videos.length > 0 && (
                <VideoDisplay 
                  src={practiceData.videos[0].src} 
                  title={practiceData.videos[0].title}
                  description={practiceData.videos[0].description}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="images" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <ImageCarousel 
                images={practiceData.images} 
                autoPlay={true}
                interval={5000}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="whiteboard" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <WhiteBoard width={500} height={350} />
            </div>
          </TabsContent>

          <TabsContent value="shapes" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <ShapesGame />
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <SenActions speechData={speechData} />
            </div>
          </TabsContent>
          
          <TabsContent value="game" className="mt-3 h-full">
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <SenGames speechData={speechData} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Practice Board
      </h2>
      <p className="text-gray-700">
        Interactive learning materials and practice activities for speech and language development.
      </p>

      <div className="w-full">
        {/* Practice Tools */}
        <div className="w-full">
          <div className="relative h-[500px] border border-gray-200 rounded-lg overflow-hidden">
            <FullScreen buttonPosition="absolute top-1 right-2 z-10">
              {renderPracticeTools()}
            </FullScreen>
          </div>
        </div>
      </div>

      {/* Practice Tips Section */}
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Practice Tips</h3>
        <div className="space-y-2">
          {speechData?.parentGuidance?.dailyPractice.map((tip: string, index: number) => (
            <div key={index} className="flex items-start">
              <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeBoard;