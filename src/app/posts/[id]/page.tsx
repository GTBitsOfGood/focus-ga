'use server'

import CommentComponent from "@/components/CommentComponent";
import PostComponent from "@/components/PostComponent";
import { getPostComments } from "@/server/db/actions/CommentActions";
import { getPost } from "@/server/db/actions/PostActions";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

type PostPageProps = {
  params: { id: string }
};

export default async function PostPage(props: PostPageProps) {
  const id = props.params.id;

  const post = await getPost(id);
  const comments = await getPostComments(id);

  return (
    <>
      <div className="mx-16 my-4 text-lg text-[#686868]">
        <a href="#" className="flex items-center gap-1">
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </a>
      </div>
      <div className="mx-32 mb-16 p-4 flex flex-col items-stretch gap-4">
        <PostComponent post={post} authorName="Placeholder" />
        <input
          className="bg-[#F3F3F3] text-black rounded-full px-5 py-2"
          placeholder="Add comment"
        />
        {comments.map(comment => <CommentComponent key={comment._id} comment={comment} authorName="Placeholder" />)}
      </div>
    </>
  );
}