import {
  CommentInput,
  commentSchema,
  PopulatedComment,
} from "@/utils/types/comment";
import CommentComponent from "../CommentComponent";
import CommentInputComponent from "./CommentInputComponent";
import { useState } from "react";
import {
  createComment,
  createCommentLike,
  deleteComment,
  deleteCommentLike,
} from "@/server/db/actions/CommentActions";
import { PopulatedUser, User } from "@/utils/types/user";
import { useRouter } from "next/navigation";

type CommentTreeContainerProps = {
  postId: string;
  parentComment: PopulatedComment;
  childComments: PopulatedComment[];
  authUser: User | PopulatedUser;
};

export default function CommentTreeContainer(props: CommentTreeContainerProps) {
  const {
    postId,
    parentComment: initialParentComment,
    childComments: initialChildComments,
    authUser,
  } = props;
  const [parentComment, setParentComment] =
    useState<PopulatedComment>(initialParentComment);
  const [childComments, setChildComments] =
    useState<PopulatedComment[]>(initialChildComments);
  const [parentDeleted, setParentDeleted] = useState<boolean>(
    initialParentComment.isDeleted,
  );
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false);

  function onReplyClick() {
    setShowReplyInput(!showReplyInput);
  }

  const router = useRouter();

  async function onReplySubmit(replyBody: string) {
    const replyInput: CommentInput = {
      author: authUser._id,
      content: replyBody,
      post: postId,
      date: new Date(),
      replyTo: parentComment._id,
    };
    const reply: PopulatedComment = {
      ...commentSchema.parse(replyInput),
      _id: "",
      author: authUser,
      post: postId,
      replyTo: parentComment._id,
      liked: false,
    };
    setChildComments((childComments) => [reply, ...childComments]);

    try {
      const replyServer: PopulatedComment = {
        ...(await createComment(replyInput)),
        author: authUser,
        post: postId,
        replyTo: parentComment._id,
        liked: false,
      };
      setChildComments((childComments) => [
        replyServer,
        ...childComments.slice(1),
      ]);
      setShowReplyInput(false);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setChildComments((childComments) => childComments.slice(1));
      throw err;
    }
  }

  async function onLikeClick(commentId: string, liked: boolean) {
    try {
      if (liked) {
        await deleteCommentLike(authUser._id, commentId);
      } else {
        await createCommentLike(authUser._id, commentId);
      }
    } catch (err) {
      console.error(`Failed to ${liked ? "dislike" : "like"} comment:`, err);
      throw err;
    }
  }

  async function onDeleteClick(commentId: string) {
    try {
      await deleteComment(commentId);
      router.refresh();
      if (commentId === parentComment._id) {
        setParentDeleted(true);
      } else {
        setChildComments((childComments) =>
          childComments.filter((comment) => comment._id !== commentId),
        );
      }
    } catch (err) {
      console.error(`Failed to delete comment:`, err);
      throw err;
    }
  }

  return parentDeleted && childComments.length === 0 ? null : (
    <CommentComponent
      comment={parentComment}
      onReplyClick={onReplyClick}
      onLikeClick={(liked) => onLikeClick(parentComment._id, liked)}
      onDeleteClick={
        authUser.isAdmin || parentComment.author?._id === authUser._id
          ? () => onDeleteClick(parentComment._id)
          : undefined
      }
      nestedContent={
        <div className="mt-2 flex flex-col gap-2">
          {showReplyInput && (
            <CommentInputComponent
              className="mb-2"
              placeholder="Reply to comment"
              onSubmit={onReplySubmit}
            />
          )}
          {childComments.map((comment) => (
            <CommentComponent
              key={comment._id}
              comment={comment}
              onLikeClick={(liked) => onLikeClick(comment._id, liked)}
              onDeleteClick={
                authUser.isAdmin || comment.author?._id === authUser._id
                  ? () => onDeleteClick(comment._id)
                  : undefined
              }
            />
          ))}
        </div>
      }
    />
  );
}
