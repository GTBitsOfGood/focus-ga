import { CommentInput, commentSchema, PopulatedComment } from "@/utils/types/comment";
import CommentComponent from "../CommentComponent";
import CommentInputComponent from "./CommentInputComponent";
import { useState } from "react";
import { createComment } from "@/server/db/actions/CommentActions";

const dummyId = '000000000000000000000000';

type CommentTreeContainerProps = {
  postId: string,
  parentComment: PopulatedComment,
  childComments: PopulatedComment[]
};

export default function CommentTreeContainer(props: CommentTreeContainerProps) {
  const { postId, parentComment: initialParentComment, childComments: initialChildComments } = props;
  const [parentComment, setParentComment] = useState<PopulatedComment>(initialParentComment);
  const [childComments, setChildComments] = useState<PopulatedComment[]>(initialChildComments);
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false);

  function onReplyClick() {
    setShowReplyInput(!showReplyInput);
  }

  async function onReplySubmit(replyBody: string) {
    const replyInput: CommentInput = {
      author: parentComment.author?._id || dummyId,
      content: replyBody,
      post: postId,
      date: new Date(),
      replyTo: parentComment._id
    };
    const reply: PopulatedComment = {
      ...commentSchema.parse(replyInput),
      _id: dummyId,
      author: parentComment.author,
      post: postId,
      replyTo: parentComment._id
    };
    setChildComments(childComments => [reply, ...childComments]);

    try {
      const replyServer: PopulatedComment = {
        ...await createComment(replyInput),
        author: parentComment.author,
        post: postId,
        replyTo: parentComment._id
      };
      setChildComments(childComments => [replyServer, ...childComments.slice(1)]);
      setShowReplyInput(false);
      return true;
    } catch (err) {
      console.error('Failed to add comment:', err);
      setChildComments(childComments => childComments.slice(1));
      return false;
    }
  }

  return (
    <CommentComponent
      comment={parentComment}
      onReplyClick={onReplyClick}
      nestedContent={(
        <div className="mt-2 flex flex-col gap-2">
          {showReplyInput && <CommentInputComponent
            className="mb-2"
            placeholder="Reply to comment"
            onSubmit={onReplySubmit}
          />}
          {childComments.map(comment => <CommentComponent key={comment._id} comment={comment} />)}
        </div>
      )}
    />
  );
}