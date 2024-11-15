import { getDateDifferenceString } from "@/utils/dateUtils";
import { PopulatedComment } from "@/utils/types/comment";
import { MessageSquare, Ellipsis, Heart } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownIt from "markdown-it";
import { ReactNode, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import Link from "next/link";
import { ProfileColors } from "@/utils/consts";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { createReport } from "@/server/db/actions/ReportActions";
import { ContentType, ReportReason } from "@/utils/types/report";
import ReportContentModal from "./ReportContentModal";

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
    className = '',
    comment,
    onLikeClick,
    onReplyClick,
    onDeleteClick,
    nestedContent
  } = props;
  
  const {
    author: initialAuthor,
    content: initialContent,
    date,
    likes: initialLikes,
    liked: initialLiked,
    replyTo,
    isDeleted: initialIsDeleted
  } = comment;

  const [author, setAuthor] = useState<User | PopulatedUser | null>(initialAuthor);
  const [content, setContent] = useState<string>(initialContent);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(initialIsDeleted);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const { user, setUser } = useUser();

  async function handleLikeClick() {
    if (likeLoading) return;

    if (liked) {
      setLikes(likes => likes - 1);
    } else {
      setLikes(likes => likes + 1);
    }
    setLiked(liked => !liked);

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
        setContent('[deleted]');
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
      }
      await createReport(reportData);
    }
  }

  const bottomRow = [
    {
      label: likes.toString(),
      icon: liked ? <Heart className="text-red-500 fill-red-500 transform transition-transform hover:scale-110" /> : <Heart className="transform transition-transform hover:scale-110" />,
      onClick: likeLoading ? undefined : handleLikeClick
    },
    ... replyTo ? [] : [{ 
      label: 'Reply',
      icon: <MessageSquare className="transform transition-transform hover:scale-110"/>,
      onClick: onReplyClick
    }]
  ];

  const profilePicture = <span className="w-6 h-6 bg-theme-gray rounded-full inline-block"/>;
  const deletedText = "This comment has been deleted.";

  return (
    <div className="flex gap-2.5">
      <Link href={`/family/${author?._id}`}>
        <span className={cn("w-6 h-6 rounded-full inline-block", author?.profileColor ? `bg-${author.profileColor}` : `bg-${ProfileColors.ProfileDefault}`)} />
      </Link>
      <div className={`flex-grow flex flex-col gap-2 text-theme-gray ${className}`}>
        <div className="flex items-center justify-between">
          {isDeleted ? deletedText : <Link className="font-bold text-black" href={`/family/${author?._id}`}>
            {author ? `${author.lastName} Family` : 'Deleted User'}
          </Link>}
          <p className="text-sm" suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
        </div>
        {!isDeleted && <>
          <MarkdownRenderer
            className="leading-5"
            markdown={content}
            parse={markdown => mdParser.render(markdown)}
          />
          <div className="flex items-center pt-2 gap-6 text-sm">
            {bottomRow.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 px-1">
                <button disabled={!item.onClick} onClick={item.onClick}>
                  <div className="w-5 h-5 [&>*]:w-full [&>*]:h-full">
                    {item.icon}
                  </div>
                </button>
                <button disabled={!item.onClick} onClick={item.onClick}>
                  {item.label}
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                  {onDeleteClick ? <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>Delete</DropdownMenuItem> : undefined}
                  {user && user._id != comment.author?._id ? <DropdownMenuItem onClick={() => setShowReportModal(true)}>Report Comment</DropdownMenuItem> : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </>}
        {nestedContent}
      </div>
      {showReportModal && <ReportContentModal
        isOpen={showReportModal}
        closeModal={() => setShowReportModal(false)}
        onSubmit={handleReportClick}
      />}
      <AlertDialog open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLoading}
              onClick={handleDeleteClick}
              className="bg-theme-blue hover:bg-theme-blue hover:opacity-90 transition"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}