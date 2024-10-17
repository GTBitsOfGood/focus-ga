import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import PostComponent from "@/components/PostComponent";

export const dynamic = 'force-dynamic';

// Dummy ID to be replaced with authenticated user when auth is implemented
const USER_ID = '66e26a641737b310a1b2774c';

export default async function Home() {
  const posts = await getPopulatedPosts(USER_ID);

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
