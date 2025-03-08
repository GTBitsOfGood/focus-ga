import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="relative pinned-posts border-2 border-light-gray rounded-lg p-4 pb-1">
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
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden mt-2"
      >
        {posts.map((post) => (
          <PostComponent key={post._id} post={post} clickable={true} />
        ))}
      </motion.div>
    
    </div>
  );
};

export default PinnedPosts;
