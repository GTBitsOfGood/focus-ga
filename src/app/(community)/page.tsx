'use server'

import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import PostComponent from "@/components/PostComponent";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getPopulatedPosts();

  return (
    <main className="flex min-h-screen flex-col items-center p-16">
      <div className="w-full max-w-4xl space-y-8">
        {posts.map((post) => {
          return <PostComponent key={post._id} post={post} clickable={true} />
        })}
      </div>
    </main>
  );
}
