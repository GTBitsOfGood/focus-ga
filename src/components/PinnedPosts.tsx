import React, { useState } from 'react';
import { PopulatedPost } from '@/utils/types/post';
import PostComponent from './PostComponent';
import { Pin } from 'lucide-react';

type PinnedPostsProps = {
  posts: PopulatedPost[];
};

const PinnedPosts: React.FC<PinnedPostsProps> = ({ posts }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="pinned-posts border-2 border-light-gray rounded-lg p-4">
      <button onClick={toggleOpen} className="flex justify-between w-full">
        <div className='flex justify-between space-x-2'>
          <Pin/>
          <h2 className="text-lg font-bold">
            Pinned Posts ({posts.length}) 
          </h2>
        </div>

        <div>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2">
          {posts.map((post) => (
            <PostComponent key={post._id} post={post} clickable={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PinnedPosts; 