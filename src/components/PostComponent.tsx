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
  Eye,
} from "lucide-react";
import { getDateDifferenceString } from "@/utils/dateUtils";
import MarkdownIt from "markdown-it";
import MarkdownRenderer from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import VisiblityIcon from "./ui/visibilityIcon";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  createPostLike,
  createPostSave,
  deletePost,
  deletePostLike,
  deletePostSave,
  editPost,
} from "@/server/db/actions/PostActions";
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
    isPrivate: boolean,
    editedByAdmin: boolean | undefined,
  ) => Promise<void>;
  onDeleteClick?: () => Promise<void>;
  onCommentClick?: () => void;
  onPostPin?: () => Promise<void>;
};

export default function PostComponent(props: PostComponentProps) {
  const mdParser = new MarkdownIt({
    html: true,
  });

  const { user } = useUser();
  const router = useRouter();

  const {
    className = "",
    post,
    clickable = false,
    onLikeClick,
    onSaveClick,
    onDeleteClick,
    onEditClick,
    onPostPin,
    onCommentClick,
  } = props;

  const searchParams = useSearchParams();
  const openModal = ["edit", "report", "delete"].filter(
    (param) => searchParams.get(param) === "true",
  );

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
    isPrivate: initialIsPrivate,
    comments,
    editedByAdmin: initialEditedByAdmin,
  } = post;

  const { toast } = useToast();

  const [title, setTitle] = useState<string>(initialTitle);
  const [editorTitle, setEditorTitle] = useState<string>(initialTitle);

  const [content, setContent] = useState<string>(initialContent);
  const [editorContent, setEditorContent] = useState<string>(initialContent);

  const [isPrivate, setIsPrivate] = useState<boolean>(initialIsPrivate);

  const [tags, setTags] = useState<(Disability | null)[]>(initialTags);
  const [editorTags, setEditorTags] = useState<(Disability)[]>(initialTags.filter((tag) => tag !== null));

  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(initialSaved);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(
    openModal.includes("edit") && openModal.length === 1,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(
    openModal.includes("delete") && openModal.length === 1,
  );
  const [showIgnoreDialog, setShowIgnoreDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(
    openModal.includes("report") && openModal.length === 1,
  );
  const [reports, setReports] = useState<PopulatedReport[]>([]);
  const [showContentReports, setShowContentReports] = useState<boolean>(false);
  const [fromReports, setFromReports] = useState<boolean>(false);
  const [editedByAdmin, setEditedByAdmin] = useState<boolean | undefined>(
    initialEditedByAdmin || undefined,
  );

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

  async function onPostLikeClick(liked: boolean) {
    try {
      if (!user) return;
      if (liked) {
        await deletePostLike(user._id, post._id);
      } else {
        await createPostLike(user._id, post._id);
      }
    } catch (err) {
      console.error(`Failed to ${liked ? "dislike" : "like"} post:`, err);
      throw err;
    }
  }

  async function onPostSaveClick(saved: boolean) {
    try {
      if (!user) return;
      if (saved) {
        await deletePostSave(user._id, post._id);
      } else {
        await createPostSave(user._id, post._id);
      }
    } catch (err) {
      console.error(`Failed to ${saved ? "unsave" : "save"} post`, err);
      throw err;
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleLikeClick() {
    if (likeLoading) return;

    if (liked) {
      setLikes((likes) => likes - 1);
    } else {
      setLikes((likes) => likes + 1);
    }
    setLiked((liked) => !liked);
    if (onPostLikeClick) {
      setLikeLoading(true);
      try {
        await onPostLikeClick(liked);
      } catch (err) {
        setLikes(likes);
        setLiked(liked);
      } finally {
        setLikeLoading(false);
      }
    }
  }

  async function handleSaveClick() {
    if (saveLoading) return;
    setSaved((saved) => !saved);

    if (onPostSaveClick) {
      setSaveLoading(true);
      try {
        await onPostSaveClick(saved);
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
        if (reports.length > 0) {
          resolveReports();
        }
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

  useEffect(() => {
    if (!fromReports) {
      setShowContentReports(false);
    }
  }, [fromReports]);

  const editedByAdminText =
    editedByAdmin && !author?.isAdmin ? "(Edited by FOCUS)" : "";

  async function handleEditClick(
    newTitle: string,
    newContent: string,
    newTags: Disability[],
    newVisibility: boolean,
    newEditedByAdmin: boolean | undefined,
    event?: React.FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();
    setTitle(newTitle);
    setContent(newContent);
    setTags(newTags);
    setIsPrivate(newVisibility);
    setEditedByAdmin(newEditedByAdmin);

    if (onEditClick) {
      try {
        await onEditClick(
          newTitle,
          newContent,
          newTags,
          newVisibility,
          newEditedByAdmin,
        );
        setShowEditModal(false);
        if (fromReports) {
          setFromReports(false);
          setShowContentReports(false);
          resolveReports();
        }
      } catch (err) {
        setTitle(title);
        setContent(content);
        setTags(tags);
        setIsPrivate(isPrivate);
        setEditedByAdmin(editedByAdmin);
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

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick();
    }
    router.push(`/posts/${post._id}?focusCommentInput=true`);
  };

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
      icon: (
        <MessageSquare
          className={cn({
            "transform transition-transform hover:scale-110": !clickable,
          })}
        />
      ),
      onClick: handleCommentClick,
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
      hide: author?._id === user?._id,
    },
  ];

  const isAuthor = user && user._id === author?._id;

  const getActionUrl = (action: string) => {
    return `/posts/${post._id}?${action}=true`;
  };

  const reactContent = (
    <>
      <div className="flex items-center justify-between text-sm">
        <UserIcon user={author} clickable={clickable} />
        <p suppressHydrationWarning>
          {getDateDifferenceString(new Date(), date)} {editedByAdminText}
        </p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="flex gap-4 text-2xl font-bold text-black break-all">
          {title}
          {isPrivate && (
            <span className="flex items-center gap-2 text-sm font-normal text-theme-gray">
              <div className="w-5 h-5">
                <img src="/eyeslash.svg" alt="Eye Slash Icon" className="w-full h-full grayscale opacity-60" />
              </div>
              <p className="whitespace-nowrap mr-2">Private</p>
            </span>
          )}
        </h2>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
            <Ellipsis className="h-6 w-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            {(isAuthor || user?.isAdmin) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                  router.push(getActionUrl("edit"));
                }}
              >
                Edit
              </DropdownMenuItem>
            )}
            {(isAuthor || user?.isAdmin) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                  router.push(getActionUrl("delete"));
                }}
              >
                Delete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleShareClick();
              }}
            >
              Share
            </DropdownMenuItem>
            {!isAuthor && !isPrivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                  router.push(getActionUrl("report"));
                }}
              >
                Report
              </DropdownMenuItem>
            )}
            {onPostPin && !isPrivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPostPin();
                }}
              >
                {post.isPinned ? "Unpin Post" : "Pin Post"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <MarkdownRenderer
        className={cn("text-lg leading-7", {
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
              className={`flex items-center gap-1.5 px-2 ${item.hide ? "hidden" : ""}`}
            >
              <div
                onClick={(e) => {
                  // Allow Liking and Saving outside of post page
                  e.stopPropagation();
                  item.onClick?.();
                }}
                className="inline-block"
              >
                <button
                  disabled={!item.onClick}
                  className={` ${item.onClick && "transition-transform hover:scale-105"}`}
                >
                  <div className="h-6 w-6 [&>*]:h-full [&>*]:w-full">
                    {item.icon}
                  </div>
                </button>
              </div>
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
            if (fromReports) {
              setShowContentReports(true);
            }
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
          title={editorTitle}
          content={editorContent}
          tags={editorTags}
          isPrivate={isPrivate}
          closeModal={() => {
            setShowEditModal(false);
            if (fromReports) {
              setShowContentReports(true);
            }
          }}
          onSubmit={handleEditClick}
          {...(fromReports
            ? { modalTitle: `Edit ${author?.lastName}'s post` }
            : {})}
          setTags={setEditorTags}
          setContent={setEditorContent}
          setTitle={setEditorTitle}
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
          onEdit={() => setShowEditModal(true)}
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
    <div className={classes} onClick={() => router.push(`/posts/${post._id}`)}>
      {reactContent}
    </div>
  ) : (
    <div className={classes}>{reactContent}</div>
  );
}
