import { getDateDifferenceString } from "@/utils/dateUtils";
import { PopulatedComment } from "@/utils/types/comment";
import {
  MessageSquare,
  Ellipsis,
  Heart,
  OctagonAlert,
  ChevronRight,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownIt from "markdown-it";
import { ReactNode, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import {
  createReport,
  editReport,
  getReportsByContentId,
} from "@/server/db/actions/ReportActions";
import {
  ContentType,
  ReportReason,
  PopulatedReport,
} from "@/utils/types/report";
import ReportContentModal from "./ReportContentModal";
import ContentReportsModal from "./ContentReportsModal";
import { useToast } from "@/hooks/use-toast";
import UserIcon from "./UserIconComponent";
import ConfirmationDialog from "./ConfirmationDialog";

type CommentComponentProps = {
  className?: string;
  comment: PopulatedComment;
  onLikeClick?: (liked: boolean) => Promise<void>;
  onReplyClick?: () => void;
  onDeleteClick?: () => Promise<void>;
  nestedContent?: ReactNode;
};

export default function CommentComponent(props: CommentComponentProps) {
  const mdParser = new MarkdownIt();

  const {
    className = "",
    comment,
    onLikeClick,
    onReplyClick,
    onDeleteClick,
    nestedContent,
  } = props;

  const {
    author: initialAuthor,
    content: initialContent,
    date,
    likes: initialLikes,
    liked: initialLiked,
    replyTo,
    isFlagged: initialIsFlagged,
    isDeleted: initialIsDeleted,
  } = comment;

  const [author, setAuthor] = useState<User | PopulatedUser | null>(
    initialAuthor,
  );
  const [content, setContent] = useState<string>(initialContent);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(initialIsDeleted);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showIgnoreDialog, setShowIgnoreDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reports, setReports] = useState<PopulatedReport[]>([]);
  const [showContentReports, setShowContentReports] = useState(false);
  const [fromReports, setFromReports] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchReports = async () => {
    try {
      const reportsData = await getReportsByContentId(comment._id);
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
    if (likeLoading) return;

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

  async function handleDeleteClick() {
    if (deleteLoading) return;

    if (onDeleteClick) {
      setDeleteLoading(true);
      try {
        await onDeleteClick();
        setShowDeleteDialog(false);
        setContent("[deleted]");
        setAuthor(null);
        setIsDeleted(true);
      } finally {
        setDeleteLoading(false);
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
        reportedContent: comment._id,
        contentType: ContentType.COMMENT,
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

  const resolveReports = async () => {
    for (const report of reports) {
      await editReport(report._id, { isResolved: true });
    }
    fetchReports();
  };

  const bottomRow = [
    {
      label: likes.toString(),
      icon: liked ? (
        <Heart className="transform fill-red-500 text-red-500 transition-transform hover:scale-110" />
      ) : (
        <Heart className="transform transition-transform hover:scale-110" />
      ),
      onClick: likeLoading ? undefined : handleLikeClick,
    },
    ...(replyTo
      ? []
      : [
          {
            label: "Reply",
            icon: (
              <MessageSquare className="transform transition-transform hover:scale-110" />
            ),
            onClick: onReplyClick,
          },
        ]),
  ];

  const profilePicture = (
    <span className="inline-block h-6 w-6 rounded-full bg-theme-gray" />
  );
  const deletedText = "This comment has been deleted.";

  return (
    <div>
      <div
        className={cn(
          "flex flex-grow flex-col gap-2 text-theme-gray",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          {isDeleted ? (
            <div className="flex gap-2">
              {profilePicture} {deletedText}
            </div>
          ) : (
            <UserIcon user={author} clickable={false} boldText />
          )}
          <p className="text-sm" suppressHydrationWarning>
            {getDateDifferenceString(new Date(), date)}
          </p>
        </div>
        <div className="flex flex-col gap-2 pl-8">
          {!isDeleted && (
            <>
              <MarkdownRenderer
                className="leading-5"
                markdown={content}
                parse={(markdown) => mdParser.render(markdown)}
              />
              <div className="flex flex-row justify-between">
                <div className="flex items-center gap-6 pt-2 text-sm">
                  {bottomRow.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <button disabled={!item.onClick} onClick={item.onClick}>
                        <div className="h-5 w-5 [&>*]:h-full [&>*]:w-full">
                          {item.icon}
                        </div>
                      </button>
                      <button disabled={!item.onClick} onClick={item.onClick}>
                        {item.label}
                      </button>
                    </div>
                  ))}
                  {onDeleteClick && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <Ellipsis className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          Delete
                        </DropdownMenuItem>
                        {user?._id !== comment.author?._id ? (
                          <DropdownMenuItem
                            onClick={() => setShowReportModal(true)}
                          >
                            Report
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {reports.length > 0 && user?.isAdmin ? (
                  <button
                    onClick={() => {
                      setFromReports(true);
                      setShowContentReports(true);
                    }}
                    className="flex flex-row items-center gap-x-1.5 rounded-full border-2 border-error-red bg-error-light-red py-1 pl-2 pr-1.5 text-error-red"
                  >
                    <div className="flex flex-row gap-x-1">
                      <OctagonAlert className="stroke-error-red" />
                      Comment Reported ({reports.length})
                    </div>
                    <ChevronRight className="stroke-" />
                  </button>
                ) : null}
              </div>
            </>
          )}
          {nestedContent}
        </div>
      </div>
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
          onEdit={() => console.log("HI")}
        />
      )}
      {showDeleteDialog && (
        <ConfirmationDialog
          handleCancel={() => {
            setShowDeleteDialog(false);
            if (fromReports) setShowContentReports(true);
          }}
          loading={deleteLoading}
          handleConfirm={handleDeleteClick}
          type="comment"
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
      {/* {showEditModal && (
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
      )} */}
    </div>
  );
}
