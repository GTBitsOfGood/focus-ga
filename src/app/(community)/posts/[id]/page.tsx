'use server'

import PostCommentsContainer from "@/components/PostPage/PostCommentsContainer";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPopulatedPost } from "@/server/db/actions/PostActions";

type PostPageProps = {
  params: { id: string }
};

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;

  const post = await getPopulatedPost(id);
  const comments = await getPostComments(id);

  return <PostCommentsContainer post={post} initialComments={comments} />;
}