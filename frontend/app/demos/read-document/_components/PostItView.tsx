'use client';

import React from 'react';
import { PostItNotes, PostItNotesData } from '@/components/ui/post-it-notes';
import FullScreen from '@/components/ui/full-screen';


interface PostItViewProps {
  data: PostItNotesData;
}

const PostItView: React.FC<PostItViewProps> = ({ data }) => {
  return (
    <FullScreen buttonPosition="absolute right-2 top-2 z-10">
      <div className="h-full overflow-y-auto p-4">
        <div className="relative">
          <PostItNotes data={data} />
        </div>
      </div>
    </FullScreen>
  );
};

export default PostItView;