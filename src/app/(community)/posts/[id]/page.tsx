'use server'

import PostCommentsContainer from "@/components/PostPage/PostCommentsContainer";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { notFound } from 'next/navigation';

type PostPageProps = {
  params: { id: string }
};

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;
  let post;

  try {
    post = await getPopulatedPost(id);
  } catch (e) {}

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(id);

  return <PostCommentsContainer post={post} initialComments={comments} />;
}