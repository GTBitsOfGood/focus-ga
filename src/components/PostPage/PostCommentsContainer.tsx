'use client'

import CommentComponent from "@/components/CommentComponent";
import PostComponent from "@/components/PostComponent";
import { createComment } from "@/server/db/actions/CommentActions";
import { CommentInput, commentSchema, PopulatedComment } from "@/utils/types/comment";
import { PopulatedPost } from "@/utils/types/post";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PostCommentsContainerProps = {
  post: PopulatedPost,
  initialComments: PopulatedComment[]
};

const dummyId = '000000000000000000000000';

export default function PostCommentsContainer(props: PostCommentsContainerProps) {
  const { post, initialComments } = props;

  const [comments, setComments] = useState<PopulatedComment[]>(initialComments);
  const [newCommentBody, setNewCommentBody] = useState<string>('');
  const [addCommentLoading, setAddCommentLoading] = useState<boolean>(false);

  async function onNewCommentSubmit() {
    if (addCommentLoading) {
      return;
    }
    setAddCommentLoading(true);

    const newCommentInput: CommentInput = {
      author: post.author?._id || dummyId,
      content: newCommentBody,
      post: post._id,
      date: new Date()
    };
    const newComment: PopulatedComment = {
      ...commentSchema.parse(newCommentInput),
      _id: dummyId,
      author: post.author,
      post: null,
      replyTo: null
    };
    setComments(comments => [newComment, ...comments]);

    try {
      const newCommentServer: PopulatedComment = {
        ...await createComment(newCommentInput),
        author: post.author,
        post: null,
        replyTo: null
      };
      setComments(comments => [newCommentServer, ...comments.slice(1)]);
      setNewCommentBody('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setComments(comments => comments.slice(1));
    } finally {
      setAddCommentLoading(false);
    }
  }

  return (
    <>
      <div className="mx-16 my-4 text-lg text-[#686868]">
        <Link href={'/'} className="flex items-center gap-1">
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </Link>
      </div>
      <div className="mx-32 mb-16 p-4 flex flex-col items-stretch gap-4">
        <PostComponent post={post} />
        <div className="flex items-center bg-[#F3F3F3] rounded-full">
          <input
            className="flex-grow pl-5 pr-3 py-2 bg-transparent outline-none select-none text-black"
            placeholder="Add comment"
            value={newCommentBody}
            onChange={e => setNewCommentBody(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newCommentBody !== '' && onNewCommentSubmit()}
          />
          <button className={newCommentBody === '' ? 'hidden' : ''} onClick={onNewCommentSubmit}>
            <PaperAirplaneIcon className="w-6 h-6 text-blue mr-4" />
          </button>
        </div>
        {comments.map(comment => <CommentComponent key={comment._id} comment={comment} />)}
      </div>
    </>
  );
}