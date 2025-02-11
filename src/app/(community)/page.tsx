'use client'

import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import PostComponent from "@/components/PostComponent";
import { useEffect, useState, useRef, useCallback } from "react";
import { PopulatedPost } from "@/utils/types/post";
import { LoaderCircle } from "lucide-react";
import FilterComponent from "@/components/FilterComponent";
import { Disability } from "@/utils/types/disability";
import { Location } from "@/utils/types/location";
import { Visiblity } from "@/utils/types/visibility"; 
import { Filter } from "@/utils/types/common";
import { PAGINATION_LIMIT } from "@/utils/consts";
import { useUser } from "@/contexts/UserContext";
import { GEORGIA_CITIES } from "@/utils/cities";
import { useSearch } from "@/contexts/SearchContext";
import ContactButton from "@/components/ContactButton";
import { useDisabilities } from "@/contexts/DisabilityContext";
import { getPopulatedPinnedPosts } from "@/server/db/actions/PostActions";
import PinnedPosts from "@/components/PinnedPosts";

export const dynamic = 'force-dynamic';

export default function Home() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useUser();
  
  const disabilities = useDisabilities();
  const [selectedDisabilities, setSelectedDisabilities] = useState<Disability[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const locations = GEORGIA_CITIES.map(city => ({ name: city, _id: city }));
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

  const { searchTerm } = useSearch();
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [pinnedPostContents, setPinnedPostContents] = useState<PopulatedPost[]>([]);

  useEffect(() => {
    if (!user) return;

    setSelectedDisabilities(user.defaultDisabilityFilters);
    setFiltersLoading(false);
  }, [user]);

  const handleSelected = <T extends { _id: string }>(
    selected: T, 
    setSelected: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setSelected((prevSelected) => {
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
    setSelected: (selected: Disability) => handleSelected(selected, setSelectedDisabilities)
  };

  const locationFilter: Filter<Location> = {
    label: "Location",
    data: locations,
    selected: selectedLocations,
    setSelected: (selected: Location) => handleSelected(selected, setSelectedLocations)
  };

  //TODO: update once demographics are added
  const demographicFilter: Filter<any> = {
    label: "Age",
    data: [],
    selected: [],
    setSelected: (selected) => {
      console.log("age selected")
    }
  };

  // fetch posts when filter changes
  useEffect(() => {
    fetchPosts(true);
  }, [selectedDisabilities, selectedLocations, searchTerm])

  // fetch posts when page changes
  const fetchPosts = async (clear: boolean = false) => {
    if (!user || filtersLoading) return;

    if (clear) {
      setPage(0);
      setHasMore(true);
      setPosts([]);
    }

    if (!hasMore && !clear) return;
    setLoading(true);

    let retries = 5;
    while (retries > 0) {
      try {
        const newPage = clear ? 0 : page;
  
        const tags = selectedDisabilities.map((disability) => disability._id);
        const locations = selectedLocations.map((location) => location.name);

        const filters = { tags, locations, searchTerm };
        const {count, posts: newPosts } = await getPopulatedPosts(user._id, user.isAdmin, newPage * PAGINATION_LIMIT, PAGINATION_LIMIT, filters);
        setTotalPostsCount(count);
        if (newPosts.length > 0) {
          setPosts(clear ? newPosts : [...posts, ...newPosts]);
        } else {
          setHasMore(false);
        }
        break;
      } catch (error) {
        retries--;
      }
    }

    setLoading(false);
  };

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
  
  useEffect(() => {
    const fetchPinnedPosts = async () => {
      if (user) {
        const posts = await getPopulatedPinnedPosts(user._id);
        setPinnedPostContents(posts.posts);
      }
    };

    fetchPinnedPosts();
  }, [user]);

  return (
    <main className="flex flex-col items-center px-16">
      <div className="w-full max-w-4xl space-y-8">
        {
          searchTerm && searchTerm.length ? (
            <div className="flex flex-row justify-between">
              <p className="text-lg">
                <span className="font-bold">Showing results for: </span>
                <span>{searchTerm}</span>
              </p>
              <p className="font-bold text-theme-gray">{totalPostsCount} {totalPostsCount !== 1 ? "Results" : "Result"}</p>
            </div>
          ) : null
        }
        <FilterComponent filters={[disabilityFilter, locationFilter, demographicFilter]}/>
        { pinnedPostContents.length > 0 && <PinnedPosts posts={pinnedPostContents} />}
        <div>
          {
            posts.length ? (
              posts.map((post, index) => {
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
              })
            ) : (
              <>
                {!loading && searchTerm && searchTerm.length ? (
                  <div className="text-center font-bold text-theme-gray text-[22px]">
                    <p>No results found for &quot;{searchTerm}&quot;.</p>
                    <p>Please try another search!</p>
                  </div>
                ) : null}

                {!loading && !searchTerm && (
                  <div className="text-center font-bold text-theme-gray text-[22px]">
                    <p>No posts found.</p>
                  </div>
                )}
              </>
            )
          }
          {loading &&
            <div className="flex items-center justify-center mt-8">
              <LoaderCircle className="animate-spin" size={32} color="#475CC6"/>
            </div>
          }
        </div>
      </div>
      <ContactButton />
    </main>
  );
}
