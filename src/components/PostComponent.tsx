"use client";

import { PopulatedPost } from "@/utils/types/post";
import Tag from "./Tag";
import {
  Bookmark,
  MessageSquare,
  Ellipsis,
  Heart,
  OctagonAlert,
  ChevronRight,
} from "lucide-react";
import { getDateDifferenceString } from "@/utils/dateUtils";
import MarkdownIt from "markdown-it";
import MarkdownRenderer from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import EditPostModal from "./EditPostModal";
import { Disability } from "@/utils/types/disability";
import { useToast } from "@/hooks/use-toast";
import ReportContentModal from "./ReportContentModal";
import {
  createReport,
  editReport,
  getReportsByContentId,
} from "@/server/db/actions/ReportActions";
import {
  ReportReason,
  ContentType,
  PopulatedReport,
} from "@/utils/types/report";
import { useUser } from "@/contexts/UserContext";
import ContentReportsModal from "./ContentReportsModal";
import UserIcon from "./UserIconComponent";
import ConfirmationDialog from "./ConfirmationDialog";

type PostComponentProps = {
  post: PopulatedPost;
  className?: string;
  clickable?: boolean;
  onLikeClick?: (liked: boolean) => Promise<void>;
  onSaveClick?: (saved: boolean) => Promise<void>;
  onEditClick?: (
    title: string,
    content: string,
    tags: Disability[],
  ) => Promise<void>;
  onDeleteClick?: () => Promise<void>;
  onPostPin?: () => Promise<void>;
};

export default function PostComponent(props: PostComponentProps) {
  const mdParser = new MarkdownIt({
    html: true,
  });

  const { user } = useUser();

  const {
    className = "",
    post,
    clickable = false,
    onLikeClick,
    onSaveClick,
    onDeleteClick,
    onEditClick,
    onPostPin,
  } = props;

  // don't render links for clickable components to avoid nested a tags
  if (clickable) {
    mdParser.renderer.rules.link_open = () =>
      '<span class="underline text-gray-900">';
    mdParser.renderer.rules.link_close = () => "</span>";
  }

  const {
    title: initialTitle,
    author,
    content: initialContent,
    date,
    tags: initialTags,
    likes: initialLikes,
    liked: initialLiked,
    saved: initialSaved,
    comments,
  } = post;

  const { toast } = useToast();

  const [title, setTitle] = useState<string>(initialTitle);
  const [content, setContent] = useState<string>(initialContent);
  const [tags, setTags] = useState<(Disability | null)[]>(initialTags);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(initialSaved);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showIgnoreDialog, setShowIgnoreDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reports, setReports] = useState<PopulatedReport[]>([]);
  const [showContentReports, setShowContentReports] = useState(false);
  const [fromReports, setFromReports] = useState(false);

  const fetchReports = async () => {
    try {
      const reportsData = await getReportsByContentId(post._id);
      setReports(
        reportsData.filter((report) => {
          return !report.isResolved;
        }),
      );
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleLikeClick() {
    if (likeLoading || clickable) return;

    if (liked) {
      setLikes((likes) => likes - 1);
    } else {
      setLikes((likes) => likes + 1);
    }
    setLiked((liked) => !liked);

    if (onLikeClick) {
      setLikeLoading(true);
      try {
        await onLikeClick(liked);
      } catch (err) {
        setLikes(likes);
        setLiked(liked);
      } finally {
        setLikeLoading(false);
      }
    }
  }

  async function handleSaveClick() {
    if (saveLoading || clickable) return;
    setSaved((saved) => !saved);

    if (onSaveClick) {
      setSaveLoading(true);
      try {
        await onSaveClick(saved);
      } catch (err) {
        setSaved(saved);
      } finally {
        setSaveLoading(false);
      }
    }
  }

  async function handleDeleteClick() {
    if (deleteLoading) return;

    if (onDeleteClick) {
      setDeleteLoading(true);
      try {
        await onDeleteClick();
      } catch (err) {
        setDeleteLoading(false);
      }
    }
  }

  const resolveReports = async () => {
    for (const report of reports) {
      await editReport(report._id, { isResolved: true });
    }
    fetchReports();
  };

  async function handleEditClick(
    newTitle: string,
    newContent: string,
    newTags: Disability[],
  ) {
    setTitle(newTitle);
    setContent(newContent);
    setTags(newTags);

    if (onEditClick) {
      try {
        await onEditClick(newTitle, newContent, newTags);
        setShowEditModal(false);
      } catch (err) {
        setTitle(title);
        setContent(content);
        setTags(tags);
        throw err;
      }
    }
  }

  async function handleReportClick(reason: string, description: string) {
    if (author && user) {
      const reportData = {
        reason: reason as ReportReason,
        description: description,
        reportedUser: author?._id,
        sourceUser: user?._id,
        reportedContent: post._id,
        contentType: ContentType.POST,
      };
      await createReport(reportData);
      toast({
        title: "Report Submitted",
        description:
          "Thank you for reporting this content. Our team will review it shortly.",
      });
      fetchReports();
    }
  }

  async function handleShareClick() {
    const url = `${window.location.origin}/posts/${post._id}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied URL!",
        description: "The URL for this post was copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy URL",
        description:
          "There was an error in copying the URL to your clipboard. Please try again.",
      });
    }
  }

  const bottomRow = [
    {
      label: likes.toString(),
      icon: liked ? (
        <Heart
          className={cn("fill-red-500 text-red-500", {
            "transform transition-transform hover:scale-110": !clickable,
          })}
        />
      ) : (
        <Heart
          className={cn({
            "transform transition-transform hover:scale-110": !clickable,
          })}
        />
      ),
      onClick: likeLoading ? undefined : handleLikeClick,
    },
    {
      label: (comments ?? "").toString(),
      icon: <MessageSquare />,
    },
    {
      label: saved ? "Saved Post" : "Save Post",
      icon: saved ? (
        <Bookmark
          className={cn("fill-theme-gray", {
            "transform transition-transform hover:scale-110": !clickable,
          })}
        />
      ) : (
        <Bookmark
          className={cn({
            "transform transition-transform hover:scale-110": !clickable,
          })}
        />
      ),
      onClick: saveLoading ? undefined : handleSaveClick,
    },
  ];

  const showReport = user && user._id !== author?._id;

  const reactContent = (
    <>
      <div className="flex items-center justify-between text-sm">
        <UserIcon user={author} clickable={clickable} />
        <p suppressHydrationWarning>
          {getDateDifferenceString(new Date(), date)}
        </p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        {!clickable && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Ellipsis className="h-6 w-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              {onEditClick && (
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDeleteClick && (
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShareClick}>
                Share
              </DropdownMenuItem>
              {showReport && (
                <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                  Report
                </DropdownMenuItem>
              )}
              {onPostPin && (
                <DropdownMenuItem onClick={onPostPin}>
                  {post.isPinned ? "Unpin Post" : "Pin Post"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <MarkdownRenderer
        className={cn("text-lg leading-5", {
          "max-h-36 overflow-hidden": clickable,
        })}
        markdown={content}
        parse={(markdown) => mdParser.render(markdown)}
      />
      <div className={cn("flex flex-wrap gap-3", { "py-1": tags.length })}>
        {tags
          .filter((tag) => tag !== null)
          .map((tag) => (
            <Tag key={`${post._id}-${tag._id}`} text={tag.name} />
          ))}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex items-center gap-6 pt-2">
          {bottomRow.map((item, index) => (
            <div
              key={`${post._id}-${index}`}
              className="flex items-center gap-1.5 px-2"
            >
              <button disabled={!item.onClick} onClick={item.onClick}>
                <div className="h-6 w-6 [&>*]:h-full [&>*]:w-full">
                  {item.icon}
                </div>
              </button>
              {item.label}
            </div>
          ))}
        </div>
        {reports.length > 0 && user?.isAdmin ? (
          <button
            onClick={
              !clickable
                ? () => {
                    setShowContentReports(true);
                    setFromReports(true);
                  }
                : undefined
            }
            className="flex flex-row items-center gap-x-1.5 rounded-full border-2 border-error-red bg-error-light-red py-1 pl-2 pr-1.5 text-error-red"
          >
            <div className="flex flex-row gap-x-1">
              <OctagonAlert className="stroke-error-red" />
              Post Reported ({reports.length})
            </div>
            <ChevronRight className="stroke-" />
          </button>
        ) : null}
      </div>
      {clickable ? (
        <div className="relative bottom-[-17px] h-[1px] w-full bg-theme-medlight-gray" />
      ) : (
        <></>
      )}{" "}
      {/* Divider border*/}
      {showDeleteDialog && (
        <ConfirmationDialog
          handleCancel={() => {
            setShowDeleteDialog(false);
            if (fromReports) setShowContentReports(true);
          }}
          loading={deleteLoading}
          handleConfirm={handleDeleteClick}
          type="post"
          resolveReports={resolveReports}
        />
      )}
      {showIgnoreDialog && (
        <ConfirmationDialog
          handleCancel={() => {
            setShowIgnoreDialog(false);
            setShowContentReports(true);
          }}
          loading={deleteLoading}
          handleConfirm={() => setShowIgnoreDialog(false)}
          type="ignore"
          resolveReports={resolveReports}
        />
      )}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          title={title}
          content={content}
          tags={tags.filter((tag) => tag !== null)}
          closeModal={() => setShowEditModal(false)}
          onSubmit={handleEditClick}
        />
      )}
      {showReportModal && (
        <ReportContentModal
          isOpen={showReportModal}
          closeModal={() => setShowReportModal(false)}
          onSubmit={handleReportClick}
        />
      )}
      {showContentReports && (
        <ContentReportsModal
          isOpen={showContentReports}
          reports={reports}
          closeModal={() => {
            setShowContentReports(false);
          }}
          onDelete={() => setShowDeleteDialog(true)}
          onIgnore={() => setShowIgnoreDialog(true)}
          setFromReports={setFromReports}
        />
      )}
    </>
  );

  const classes = cn(
    "flex flex-col gap-2 text-theme-gray rounded-lg",
    { "cursor-pointer hover:bg-gray-100 p-4": clickable },
    className,
  );

  return clickable ? (
    <Link className={classes} href={`/posts/${post._id}`}>
      {reactContent}
    </Link>
  ) : (
    <div className={classes}>{reactContent}</div>
  );
}
