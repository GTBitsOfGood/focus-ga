'use client'

import CommentComponent from "@/components/CommentComponent";
import PostComponent from "@/components/PostComponent";
import { Comment, commentSchema } from "@/utils/types/comment";
import { Post, postSchema } from "@/utils/types/post";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";

export default function PostPage() {
  const params = useSearchParams();
  const id = params.get('id') as string;

  const dummyId = '000000000000000000000000';

  const post: Post = {
    ...postSchema.parse({
      author: dummyId,
      title: 'Title of the post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam interdum ligula et dolor pellentesque sollicitudin. Nullam molestie imperdiet eros eu sodales. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc eleifend quam at ullamcorper sagittis. Nam ultricies ipsum non turpis tempus non turpis temp...',
      date: new Date('September 19, 2024 11:55:12'),
      tags: ['Autism', 'Cancer', 'Diabetes'],
      likes: 11,
      comments: 3
    }),
    _id: id
  };

  const firstComment: Comment = {
    ...commentSchema.parse({
      author: dummyId,
      post: dummyId,
      date: new Date('September 19, 2024 15:05:01'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam interdum ligula et dolor pellentesque sollicitudin. Nullam molestie imperdiet eros eu sodales. Class aptent taciti sociosqu'
    }),
    _id: dummyId
  };

  const secondComment: Comment = {
    ...commentSchema.parse({
      author: dummyId,
      post: dummyId,
      date: new Date('September 19, 2024 17:06:05'),
      content: 'This is a comment.'
    }),
    _id: dummyId
  };

  return (
    <>
      <div className="mx-16 my-4 text-lg text-[#686868]">
        <a href="#" className="flex items-center gap-1">
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </a>
      </div>
      <div className="mx-32 p-4 flex flex-col items-stretch gap-4">
        <PostComponent post={post} authorName={'Fake User 1'} />
        <div className="bg-[#F3F3F3] text-[#A3A3A3] rounded-full px-5 py-2">
          Add comment
        </div>
        <CommentComponent comment={firstComment} authorName={'Fake User 2'} />
        <CommentComponent comment={secondComment} authorName={'Fake User 3'} />
      </div>
    </>
  );
}