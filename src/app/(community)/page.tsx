'use client'

import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import PostComponent from "@/components/PostComponent";
import { useEffect, useState, useRef, useCallback } from "react";
import { PopulatedPost } from "@/utils/types/post";
import { LoaderCircle } from "lucide-react";
import FilterComponent from "@/components/FilterComponent";

export const dynamic = 'force-dynamic';

export default function Home() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 5;

  // Fetch posts when page changes
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newPosts = await getPopulatedPosts(page * limit, limit);
      if (newPosts.length > 0) {
        setPosts((prevPosts) => {
          return [...prevPosts, ...newPosts];
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, hasMore, loading]);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  // Handle infinite scrolling using IntersectionObserver
  const observer = useRef<IntersectionObserver | null>(null);
  const secondLastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <main className="flex min-h-screen flex-col items-center px-16">
      <div className="w-full max-w-4xl space-y-8">
        <FilterComponent />
        <div>
          {posts.map((post, index) => {
            if (posts.length <= index + 2) {
              // Attach observer to the second-to-last post
              return (
                <div ref={secondLastPostRef} key={post._id}>
                  <PostComponent post={post} clickable={true} />
                </div>
              );
            } else {
              return <PostComponent key={post._id} post={post} clickable={true} />;
            }
          })}
          {loading && 
            <div className="flex items-center justify-center">
              <LoaderCircle className="animate-spin text-blue-500" size={32}/>
            </div>
          }
        </div>
      </div>
    </main>
  );
}
