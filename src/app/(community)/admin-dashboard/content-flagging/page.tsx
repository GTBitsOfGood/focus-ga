"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Profanity, ProfanityInput } from "@/utils/types/profanity";
import Tag from "@/components/Tag";
import {
  addProfanity,
  getAllProfanities,
  deleteProfanity,
} from "@/server/db/actions/ProfanityActions";
import { getPopulatedPosts } from "@/server/db/actions/PostActions";
import { useUser } from "@/contexts/UserContext";
import { PAGINATION_LIMIT } from "@/utils/consts";
import { PopulatedPost } from "@/utils/types/post";
import PostComponent from "@/components/PostComponent";
import { getFlaggedComments } from "@/server/db/actions/CommentActions";
import { PopulatedComment } from "@/utils/types/comment";
import CommentComponent from "@/components/CommentComponent";

export default function ProfanityList() {
  const [profanities, setProfanities] = useState<Profanity[]>([]);
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [profanityName, setProfanityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"words" | "flagged" | "comments">("words");

  const { user } = useUser();

  const [flaggedComments, setFlaggedComments] = useState<PopulatedComment[]>([]);

  useEffect(() => {
    async function fetchProfanities() {
      try {
        const response = await getAllProfanities();
        setProfanities(response);
      } catch (error) {
        setError("Failed to load profanities.");
      }
    }
    fetchProfanities();
  }, []);

  // fetch posts when page changes
  const fetchPosts = async (clear: boolean = false) => {
    if (!user) return;

    if (clear) {
      setPage(0);
      setHasMore(true);
      setPosts([]);
    }

    if (!hasMore && !clear) return;
    setPostsLoading(true);

    let retries = 5;
    while (retries > 0) {
      try {
        const newPage = clear ? 0 : page;

        const filters = {
          isFlagged: [true],
        };
        const { count, posts: newPosts } = await getPopulatedPosts(
          user._id,
          user.isAdmin,
          newPage * PAGINATION_LIMIT,
          PAGINATION_LIMIT,
          filters,
        );
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

    setPostsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const observer = useRef<IntersectionObserver | null>(null);
  const secondLastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (postsLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [postsLoading, hasMore],
  );

  const handleAddProfanity = async () => {
    if (!profanityName.trim()) return;
    try {
      const newProfanity: ProfanityInput = { name: profanityName };
      const createdProfanity = await addProfanity(newProfanity);
      setProfanities((prev) => [...prev, createdProfanity]);
      setProfanityName("");
      toast({
        title: "Profanity added",
        description: `${profanityName} has been added as a profanity.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add profanity",
        description: `An error occurred while adding the profanity. "${profanityName}" may have already been added.`,
      });
    }
  };

  const handleDeleteProfanity = async (id: string) => {
    try {
      await deleteProfanity(id);
      setProfanities((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "Profanity deleted",
        description: "The profanity has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete profanity",
        description:
          "An error occurred while deleting the profanity. Please try again.",
      });
    }
  };

  const filteredProfanities = profanities.filter((profanity) =>
    profanity.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedProfanities = filteredProfanities.reduce(
    (acc: Record<string, Profanity[]>, profanity) => {
      const firstLetter = /^[a-zA-Z]/.test(profanity.name)
        ? profanity.name[0].toUpperCase()
        : "Other";
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(profanity);
      return acc;
    },
    {},
  );

  const sortedLetters = Object.keys(groupedProfanities).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const fetchFlaggedComments = async () => {
    if (!user) return;
    try {
      setCommentsLoading(true);
      const comments = await getFlaggedComments(user._id);
      setFlaggedComments(comments);
      setCommentsLoading(false);
    } catch (error) {
      console.error("Failed to load flagged comments.");
    }
  };

  useEffect(() => {
    fetchFlaggedComments();
  }, [user]);

  const renderContent = () => {
    if (activeTab === "words") {
      return (
        <>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <h2 className="mb-3 text-xl">Add New Word</h2>
          <div className="mb-6 flex items-center gap-3">
            <input
              type="text"
              value={profanityName}
              onChange={(e) => setProfanityName(e.target.value)}
              placeholder="Enter profanity"
              onKeyDown={(e) => e.key === "Enter" && handleAddProfanity()}
              className="h-10 w-full rounded-md border p-3 py-1.5 text-sm"
            />
            <button
              className="h-10 rounded-md bg-theme-blue px-6 py-1.5 text-white transition hover:opacity-90"
              onClick={handleAddProfanity}
            >
              Add
            </button>
          </div>
          <h2 className="mb-3 text-xl">Current Profanity List</h2>
          <div className="mb-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Search className="text-theme-gray" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-60 border-b p-1 pl-0 focus:border-theme-gray focus:outline-none"
                />
              </div>
            </div>

            {sortedLetters.map((letter) => (
              <div key={letter} className="mb-4">
                <div className="mb-2 text-lg">{letter}</div>
                <div className="flex flex-wrap gap-3">
                  {groupedProfanities[letter].map((profanity) => (
                    <Tag
                      key={profanity._id}
                      text={profanity.name}
                      isClickable={true}
                      onClick={() => handleDeleteProfanity(profanity._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    } else if (activeTab === "flagged") {
      return (
        <div>
          <div>
            {posts.length ? (
              posts.map((post, index) => {
                if (posts.length <= index + 2) {
                  // Attach observer to the second-to-last post
                  return (
                    <div ref={secondLastPostRef} key={post._id}>
                      <PostComponent post={post} clickable={true} />
                    </div>
                  );
                } else {
                  return (
                    <PostComponent
                      key={post._id}
                      post={post}
                      clickable={true}
                    />
                  );
                }
              })
            ) : (
              <p className="text-center font-bold text-theme-med-gray">
                No flagged posts!
              </p>
            )}
            {postsLoading && (
              <div className="mt-8 flex items-center justify-center">
                <LoaderCircle
                  className="animate-spin"
                  size={32}
                  color="#475CC6"
                />
              </div>
            )}
          </div>
        </div>
      );
    } else if (activeTab === "comments") {
      return (
        <div>
          {flaggedComments.map((comment: PopulatedComment) => {
            return (
              <div key={comment._id}>
                <CommentComponent comment={comment} clickable={true} />
              </div>
            );
          })}
          {commentsLoading ? (
            <div className="mt-8 flex items-center justify-center">
              <LoaderCircle
                className="animate-spin"
                size={32}
                color="#475CC6"
              />
            </div>
          ) : (
            flaggedComments.length != 0 || (
              <p className="text-center font-bold text-theme-med-gray">
                No flagged comments!
              </p>
            )
          )}
        </div>
      );
    }
  };

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-8 text-2xl font-bold">Content Flagging</h1>
      <div className="mb-6 flex space-x-16">
        <button
          className={`pb-1 text-lg font-semibold ${activeTab === "words" ? "border-b-4 border-theme-blue font-bold pb-0" : ""}`}
          onClick={() => setActiveTab("words")}
        >
          Current Words
        </button>
        <button
          className={`pb-1 text-lg font-semibold mr-10 ${activeTab === "flagged" ? "border-b-4 border-theme-blue font-bold pb-0" : ""}`}
          onClick={() => setActiveTab("flagged")}
        >
          Flagged Posts
        </button>
        <button
          className={`pb-1 text-lg font-semibold ${activeTab === "comments" ? "border-b-4 border-theme-blue font-bold pb-0" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          Flagged Comments
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
