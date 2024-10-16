'use server'

import PostCommentsContainer from "@/components/PostPage/PostCommentsContainer";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { getUser } from "@/server/db/actions/UserActions";
import { notFound } from 'next/navigation';

// Dummy ID to be replaced with authenticated user when auth is implemented
const USER_ID = '66e26a641737b310a1b2774c';

type PostPageProps = {
  params: { id: string }
};

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;
  let post;
  let authUser;

  try {
    post = await getPopulatedPost(id);
  } catch (e) {}

  if (!post) {
    notFound();
  }

  try {
    authUser = await getUser(USER_ID);
  } catch (e) {
    // TODO: Handle this properly when auth is implemented - for now, USER_ID must point to a valid user
    return 'User matching USER_ID constant not found';
  }

  const comments = await getPostComments(id);

  return <PostCommentsContainer post={post} initialComments={comments} authUser={authUser} />;
}