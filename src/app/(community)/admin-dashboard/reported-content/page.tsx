"use client";
import PostComponent from "@/components/PostComponent";
import { getPopulatedPost } from "@/server/db/actions/PostActions";
import { getReportsExcludingLanguage } from "@/server/db/actions/ReportActions";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { Types } from "mongoose";
import { LoaderCircle } from "lucide-react";
import { PopulatedPost } from "@/utils/types/post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommentComponent from "@/components/CommentComponent";
import { PopulatedComment } from "@/utils/types/comment";
import { getPopulatedComment } from "@/server/db/actions/CommentActions";

export default function ReportedContent() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [comments, setComments] = useState<PopulatedComment[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const hasUnresolvedPosts = posts.length !== 0;
  const hasUnresolvedComments = comments.length != 0;

  useEffect(() => {
    fetchUnresolvedReports();
  }, []);

  const fetchUnresolvedReports = async () => {
    if (!user) return;
    setLoading(true);
    const initReports = await getReportsExcludingLanguage();
    const unresolvedReportedPosts: { id: Types.ObjectId; date: Date }[] = [];
    const unresolvedReportedComments: { id: Types.ObjectId; date: Date }[] = [];
    initReports.forEach((report) => {
      const reportedContentId = report.reportedContent;
      if (!report.isResolved) {
        if (
          !unresolvedReportedPosts.some(
            (item) => item.id.toString() === reportedContentId.toString(),
          ) &&
          report.contentType === "Post"
        ) {
          unresolvedReportedPosts.push({
            id: reportedContentId,
            date: report.date,
          });
        } else if (
          !unresolvedReportedComments.some(
            (item) => item.id.toString() === reportedContentId.toString(),
          ) &&
          report.contentType === "Comment"
        ) {
          unresolvedReportedComments.push({
            id: reportedContentId,
            date: report.date,
          });
        }
      }
    });
    sortByDate(unresolvedReportedPosts);
    let postsArr: PopulatedPost[] = await Promise.all(
      unresolvedReportedPosts.map(async (postInfo) => {
        const idAsString = postInfo.id.toString();
        return await getPopulatedPost(idAsString, user._id, user.isAdmin);
      }),
    );

    sortByDate(unresolvedReportedComments);
    let commentsArr: PopulatedComment[] = await Promise.all(
      unresolvedReportedComments.map(async (commentInfo) => {
        const idAsString = commentInfo.id.toString();
        return await getPopulatedComment(idAsString, user._id);
      }),
    );

    setPosts(postsArr);
    setComments(commentsArr);
    setLoading(false);
  };

  const sortByDate = (reports: { id: Types.ObjectId; date: Date }[]) => {
    return reports.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-7 text-2xl font-bold">Reported Content</h1>
      <Tabs defaultValue="posts" onValueChange={fetchUnresolvedReports}>
        <TabsList className="mb-4">
          <TabsTrigger
            size="large"
            className="flex gap-3 text-lg font-semibold"
            value="posts"
          >
            Reported Posts
            {hasUnresolvedPosts && (
              <span className="aspect-square h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>

          <TabsTrigger
            size="large"
            className="flex gap-3 text-lg font-semibold"
            value="comments"
          >
            Reported Comments
            {hasUnresolvedComments && (
              <span className="aspect-square h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div>
            {posts.map((post) => {
              return (
                <PostComponent key={post._id} post={post} clickable={true} />
              );
            })}
            {loading ? (
              <div className="mt-8 flex items-center justify-center text-theme-blue ">
                <LoaderCircle className="animate-spin" size={32} />
              </div>
            ) : (
              hasUnresolvedPosts || (
                <p className="text-center font-bold text-theme-med-gray">
                  No reported posts!
                </p>
              )
            )}
          </div>
        </TabsContent>
        <TabsContent value="comments">
          <div>
            {comments.map((comment: PopulatedComment) => {
              return (
                <div key={comment._id}>
                  <CommentComponent comment={comment} clickable={true} />
                </div>
              );
            })}
            {loading ? (
              <div className="mt-8 flex items-center justify-center text-theme-blue">
                <LoaderCircle className="animate-spin" size={32} />
              </div>
            ) : (
              hasUnresolvedComments || (
                <p className="text-center font-bold text-theme-med-gray">
                  No reported comments!
                </p>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
