'use client'

import CommentComponent from "@/components/CommentComponent";
import PostComponent from "@/components/PostComponent";
import { createComment } from "@/server/db/actions/CommentActions";
import { Comment, CommentInput, commentSchema } from "@/utils/types/comment";
import { Post } from "@/utils/types/post";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";

type PostCommentsContainerProps = {
  post: Post,
  initialComments: Comment[]
};

export default function PostCommentsContainer(props: PostCommentsContainerProps) {
  const { post, initialComments } = props;

  // TODO: this is just the ID of the post author; replace this with real
  // logged-in ID (and/or other necessary changes) when auth is implemented
  const userId = post.author.toString();

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newCommentBody, setNewCommentBody] = useState<string>('');
  const [addCommentLoading, setAddCommentLoading] = useState<boolean>(false);

  async function onNewCommentSubmit() {
    if (addCommentLoading) {
      return;
    }
    setAddCommentLoading(true);

    const newCommentInput: CommentInput = {
      author: userId,
      content: newCommentBody,
      post: post._id,
      date: new Date()
    };
    const newComment: Comment = { ...commentSchema.parse(newCommentInput), _id: '' };
    setComments(comments => [newComment, ...comments]);

    try {
      const newCommentServer = await createComment(newCommentInput);
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
        <a href="#" className="flex items-center gap-1">
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </a>
      </div>
      <div className="mx-32 mb-16 p-4 flex flex-col items-stretch gap-4">
        <PostComponent post={post} authorName="Placeholder" />
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
        {comments.map(comment => <CommentComponent key={comment._id} comment={comment} authorName="Placeholder" />)}
      </div>
    </>
  );
}