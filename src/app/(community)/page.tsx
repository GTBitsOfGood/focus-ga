'use client'

import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import PostComponent from "@/components/PostComponent";
import { useEffect, useState, useRef, useCallback, use } from "react";
import { PopulatedPost } from "@/utils/types/post";
import { LoaderCircle } from "lucide-react";
import FilterComponent from "@/components/FilterComponent";
import { Disability } from "@/utils/types/disability";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { Filter } from "@/utils/types/common";
import { PAGINATION_LIMIT } from "@/utils/consts";
import { useUser } from "@/hooks/user";

export const dynamic = 'force-dynamic';

export default function Home() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const user = useUser();
  console.log(user);
  
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [selectedDisabilities, setSelectedDisabilities] = useState<Disability[]>([]);

  // fetch disabilities on page load
  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilityList = await getDisabilities();
      setDisabilities(disabilityList);
    };
    fetchDisabilities();
  }, []);

  const handleDisabilitySelected = (selected: Disability) => {
    setSelectedDisabilities((prevSelected) => {
      if (prevSelected.some((item) => item._id === selected._id)) {
        return prevSelected.filter((item) => item._id !== selected._id);
      } else {
        return [...prevSelected, selected];
      }
    });
  };

  const disabilityFilter: Filter<Disability> = {
    label: "Disability",
    data: disabilities,
    selected: selectedDisabilities,
    setSelected: handleDisabilitySelected
  };

  //TODO: update once locations are added
  const locationFilter: Filter<any> = {
    label: "Location",
    data: [],
    selected: [],
    setSelected: (selected) => {
      console.log("location selected")
    }
  };

  //TODO: update once demographics are added
  const demographicFilter: Filter<any> = {
    label: "Other Demographics",
    data: [],
    selected: [],
    setSelected: (selected) => {
      console.log("demographic selected")
    }
  };

  // fetch posts when filter changes
  useEffect(() => {
    fetchPosts(true);
  }, [selectedDisabilities])

  // Fetch posts when page changes
  const fetchPosts = async (clear: boolean = false) => {
    if (!user) return;

    if (clear) {
      setPage(0);
      setHasMore(true);
      setPosts([]);
    }

    if (loading || !(hasMore || clear)) return;
    setLoading(true);
    try {
      const newPage = clear ? 0 : page;

      const tags = selectedDisabilities.map((disability) => disability._id);

      const newPosts = await getPopulatedPosts(user._id, newPage * PAGINATION_LIMIT, PAGINATION_LIMIT, tags);
      if (newPosts.length > 0) {
        setPosts(clear ? newPosts : [...posts, ...newPosts]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [page, user]);

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

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-16">
      <div className="w-full max-w-4xl space-y-8">
        <FilterComponent filters={[disabilityFilter, locationFilter, demographicFilter]}/>
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
              <LoaderCircle className="animate-spin" size={32} color="#475CC6"/>
            </div>
          }
        </div>
      </div>
    </main>
  );
}
