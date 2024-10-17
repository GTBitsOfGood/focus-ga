'use client'

import PostComponent from "@/components/PostComponent";
import { createComment } from "@/server/db/actions/CommentActions";
import { CommentInput, commentSchema, PopulatedComment } from "@/utils/types/comment";
import { PopulatedPost } from "@/utils/types/post";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CommentInputComponent from "./CommentInputComponent";
import CommentTreeContainer from "./CommentTreeContainer";
import { User } from "@/utils/types/user";
import { createPostLike, deletePostLike } from "@/server/db/actions/PostActions";

function buildChildCommentsMap(comments: PopulatedComment[]) {
  const map = new Map<string, PopulatedComment[]>();
  comments.forEach(comment => {
    if (!comment.replyTo) return;
    if (!map.has(comment.replyTo)) {
      map.set(comment.replyTo, []);
    }
    map.get(comment.replyTo)?.push(comment);
  });
  return map;
}

type PostCommentsContainerProps = {
  post: PopulatedPost;
  comments: PopulatedComment[];
  authUser: User;
};

export default function PostCommentsContainer(props: PostCommentsContainerProps) {
  const { post, comments: initialComments, authUser } = props;

  const [parentComments, setParentComments] = useState<PopulatedComment[]>(
    initialComments.filter(comment => comment.replyTo === null)
  );
  const [childComments, setChildComments] = useState<Map<string, PopulatedComment[]>>(
    buildChildCommentsMap(initialComments)
  );

  async function onNewCommentSubmit(newCommentBody: string) {
    const newCommentInput: CommentInput = {
      author: authUser._id,
      content: newCommentBody,
      post: post._id,
      date: new Date()
    };
    const newComment: PopulatedComment = {
      ...commentSchema.parse(newCommentInput),
      _id: '',
      author: authUser,
      post: post._id,
      replyTo: null,
      liked: false
    };
    setParentComments(comments => [newComment, ...comments]);

    try {
      const newCommentServer: PopulatedComment = {
        ...await createComment(newCommentInput),
        author: authUser,
        post: post._id,
        replyTo: null,
        liked: false
      };
      setParentComments(comments => [newCommentServer, ...comments.slice(1)]);
    } catch (err) {
      console.error('Failed to add comment:', err);
      setParentComments(comments => comments.slice(1));
      throw err;
    }
  }

  async function onPostLikeClick(liked: boolean) {
    if (liked) {
      await deletePostLike(authUser._id, post._id);
    } else {
      await createPostLike(authUser._id, post._id);
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
        <PostComponent
          post={post}
          onLikeClick={onPostLikeClick}
        />
        <CommentInputComponent
          placeholder="Add comment"
          onSubmit={onNewCommentSubmit}
        />
        {parentComments.map(comment => (
          <CommentTreeContainer
            key={comment._id}
            postId={post._id}
            parentComment={comment}
            childComments={childComments.get(comment._id) || []}
            authUser={authUser}
          />
        ))}
      </div>
    </>
  );
}