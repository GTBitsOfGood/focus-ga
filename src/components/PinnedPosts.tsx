import React, { useState } from 'react';
import { PopulatedPost } from '@/utils/types/post';
import PostComponent from './PostComponent';
import { Pin, ChevronDown, ChevronUp } from 'lucide-react';

type PinnedPostsProps = {
  posts: PopulatedPost[];
};

const PinnedPosts: React.FC<PinnedPostsProps> = ({ posts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative pinned-posts border-2 border-light-gray rounded-lg p-4">
      <button onClick={toggleOpen} className="flex justify-between w-full">
        <div className='flex justify-between space-x-2'>
          <Pin/>
          <h2 className="text-lg font-bold">
            Pinned Posts ({posts.length}) 
          </h2>
        </div>

        <div>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2">
          {posts.map((post) => (
            <PostComponent key={post._id} post={post} clickable={true} />
          ))}
        </div>
      )}

      {/* Horizontal Bar */}
      <div className="absolute bottom-3 left-0 right-0 h-1 bg-white" />
    </div>
  );
};

export default PinnedPosts;
