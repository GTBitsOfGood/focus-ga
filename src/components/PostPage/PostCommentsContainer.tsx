"use client";

import PostComponent from "@/components/PostComponent";
import { createComment } from "@/server/db/actions/CommentActions";
import {
  CommentInput,
  commentSchema,
  PopulatedComment,
} from "@/utils/types/comment";
import { PopulatedPost } from "@/utils/types/post";
import { useState } from "react";
import CommentInputComponent from "./CommentInputComponent";
import CommentTreeContainer from "./CommentTreeContainer";
import {
  createPostLike,
  createPostSave,
  deletePost,
  deletePostLike,
  deletePostSave,
  editPost,
} from "@/server/db/actions/PostActions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Disability } from "@/utils/types/disability";
import BackButton from "../BackButton";
import { User, PopulatedUser } from "@/utils/types/user";
import { pinPost, unpinPost } from "@/server/db/actions/PostActions";

function buildChildCommentsMap(comments: PopulatedComment[]) {
  const map = new Map<string, PopulatedComment[]>();
  comments.forEach((comment) => {
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
  authUser: User | PopulatedUser;
};

export default function PostCommentsContainer(
  props: PostCommentsContainerProps,
) {
  const { post, comments: initialComments, authUser } = props;

  const router = useRouter();
  const { toast } = useToast();

  const [childComments, setChildComments] = useState<
    Map<string, PopulatedComment[]>
  >(buildChildCommentsMap(initialComments));
  const [parentComments, setParentComments] = useState<PopulatedComment[]>(
    initialComments.filter(
      (comment) =>
        comment.replyTo === null &&
        (comment.isDeleted === false || childComments.get(comment._id)),
    ),
  );

  const showEdit = post.author?._id === authUser._id || authUser.isAdmin;
  const showDelete = post.author?._id === authUser._id || authUser.isAdmin;

  async function onNewCommentSubmit(newCommentBody: string) {
    const newCommentInput: CommentInput = {
      author: authUser._id,
      content: newCommentBody,
      post: post._id,
      date: new Date(),
    };
    const newComment: PopulatedComment = {
      ...commentSchema.parse(newCommentInput),
      _id: "",
      author: authUser,
      post: post._id,
      replyTo: null,
      liked: false,
    };
    setParentComments((comments) => [newComment, ...comments]);

    try {
      const newCommentServer: PopulatedComment = {
        ...(await createComment(newCommentInput)),
        author: authUser,
        post: post._id,
        replyTo: null,
        liked: false,
      };
      setParentComments((comments) => [newCommentServer, ...comments.slice(1)]);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setParentComments((comments) => comments.slice(1));
      throw err;
    }
  }

  async function onPostLikeClick(liked: boolean) {
    try {
      if (liked) {
        await deletePostLike(authUser._id, post._id);
      } else {
        await createPostLike(authUser._id, post._id);
      }
    } catch (err) {
      console.error(`Failed to ${liked ? "dislike" : "like"} post:`, err);
      throw err;
    }
  }

  async function onPostSaveClick(saved: boolean) {
    try {
      if (saved) {
        await deletePostSave(authUser._id, post._id);
      } else {
        await createPostSave(authUser._id, post._id);
      }
    } catch (err) {
      console.error(`Failed to ${saved ? "unsave" : "save"} post`, err);
      throw err;
    }
  }

  async function onPostEditClick(
    title: string,
    content: string,
    tags: Disability[],
  ) {
    try {
      await editPost(post._id, {
        title,
        content,
        tags: tags.map((tag) => tag._id),
      });
      toast({
        title: "Post successfully edited",
        description: "Your post has been edited successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to edit post",
        description: "There was an error editing your post. Please try again.",
      });
      console.error("Failed to edit post:", err);
      throw err;
    }
  }

  async function onPostDeleteClick() {
    try {
      await deletePost(post._id);
      router.push("/");
      toast({
        title: "Post successfully deleted",
        description:
          "The post has been successfully deleted from the community.",
      });
    } catch (err) {
      console.error("Failed to delete post:", err);
      throw err;
    }
  }
  async function onPostPin() {
    if (post.isPinned) {
      // If the post is already pinned, call the unpin action
      const unpinResponse = await unpinPost(authUser._id, post._id);
      if (unpinResponse.error) {
        toast({
          title: "Failed to unpin post",
          description: unpinResponse.error,
        });
        return;
      }
      toast({
        title: "Post successfully unpinned",
        description: "The post has been unpinned.",
      });
    } else {
      // If the post is not pinned, call the pin action
      const pinResponse = await pinPost(authUser._id, post._id);
      if (pinResponse.error) {
        toast({
          title: "Failed to pin post",
          description: pinResponse.error,
        });
        return;
      }
      toast({
        title: "Post successfully pinned",
        description: "The post has been pinned.",
      });
    }
  }

  return (
    <>
      <div className="mx-16 my-4 text-lg text-[#686868]">
        <BackButton />
      </div>
      <div className="mx-32 mb-16 flex flex-col items-stretch gap-4 p-4">
        <PostComponent
          post={post}
          onLikeClick={onPostLikeClick}
          onSaveClick={onPostSaveClick}
          onEditClick={showEdit ? onPostEditClick : undefined}
          onDeleteClick={showDelete ? onPostDeleteClick : undefined}
          onPostPin={authUser.isAdmin ? onPostPin : undefined}
        />
        <CommentInputComponent
          placeholder="Add comment"
          onSubmit={onNewCommentSubmit}
        />
        {parentComments.map((comment) => (
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
