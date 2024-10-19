import PostCommentsContainer from "@/components/PostPage/PostCommentsContainer";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { getUser } from "@/server/db/actions/UserActions";
import { USER_ID } from "@/utils/consts";
import { notFound } from 'next/navigation';

type PostPageProps = {
  params: { id: string }
};

export const dynamic = 'force-dynamic';

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;
  let authUser;
  let post;

  try {
    authUser = await getUser(USER_ID);
  } catch (e) {
    // TODO: Handle this properly when auth is implemented - for now, USER_ID must point to a valid user
    return 'User matching USER_ID constant not found';
  }

  try {
    post = await getPopulatedPost(id, authUser._id);
  } catch (e) {}

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(id, authUser._id);

  return <PostCommentsContainer post={post} comments={comments} authUser={authUser} />;
}