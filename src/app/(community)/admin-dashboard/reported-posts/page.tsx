"use client";
import PostComponent from "@/components/PostComponent";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { getReports } from "@/server/db/actions/ReportActions";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { Types } from "mongoose";
import { LoaderCircle } from "lucide-react";
import { PopulatedPost } from "@/utils/types/post";

export default function ReportedPosts() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnresolvedPosts();
  }, []);

  const fetchUnresolvedPosts = async () => {
    if (!user) return;
    setLoading(true);
    const initReports = await getReports();
    const unresolvedReportedPostsArr: { postId: Types.ObjectId; date: Date }[] =
      [];
    initReports.forEach((report) => {
      const reportedContentId = report.reportedContent;
      if (
        !report.isResolved &&
        !unresolvedReportedPostsArr.some(
          (item) => item.postId.toString() === reportedContentId.toString(),
        ) &&
        report.contentType === "Post"
      ) {
        unresolvedReportedPostsArr.push({
          postId: reportedContentId,
          date: report.date,
        });
      }
    });

    unresolvedReportedPostsArr.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    let postsArr: PopulatedPost[] = await Promise.all(
      unresolvedReportedPostsArr.map(async (postInfo) => {
        const idAsString = postInfo.postId.toString();
        return await getPopulatedPost(idAsString, user._id, user.isAdmin);
      }),
    );
    setLoading(false);
    setPosts(postsArr);
  };

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-[33px] text-2xl font-bold">Reported Posts</h1>
      {posts.map((post, index) => {
        return <PostComponent key={post._id} post={post} clickable={true} />;
      })}
      {loading &&
            <div className="flex items-center justify-center mt-8">
              <LoaderCircle className="animate-spin" size={32} color="#475CC6"/>
            </div>
          }
    </div>
  );
}
