import PostCommentsContainer from "@/components/PostPage/PostCommentsContainer";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { notFound } from 'next/navigation';

type PostPageProps = {
  params: { id: string }
};

export const dynamic = 'force-dynamic';

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;
  let post;
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  try {
    post = await getPopulatedPost(id, user._id, user.isAdmin);
  } catch (e) {}

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(id, user._id);

  return <PostCommentsContainer post={post} comments={comments} authUser={user} />;
}