import { getDateDifferenceString } from "@/utils/dateUtils";
import { PopulatedComment } from "@/utils/types/comment";
import { MessageSquare, Ellipsis, Heart } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownIt from "markdown-it";
import { ReactNode, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

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
    author,
    content,
    date,
    likes: initialLikes,
    liked: initialLiked,
    replyTo
  } = comment;

  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

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

  }

  const bottomRow = [
    {
      label: likes.toString(),
      icon: liked ? <Heart className="text-red-500 fill-red-500" /> : <Heart />,
      onClick: likeLoading ? undefined : handleLikeClick
    },
    ... replyTo ? [] : [{ 
      label: 'Reply',
      icon: <MessageSquare />,
      onClick: onReplyClick
    }]
  ];

  return (
    <>
      <div className="flex gap-2.5">
        <div>
          <span className="w-6 h-6 bg-focus-med-gray rounded-full inline-block"/>
        </div>
        <div className={`flex-grow flex flex-col gap-2 text-focus-gray ${className}`}>
          <div className="flex items-center justify-between">
            <div className="font-bold text-black">
              {author ? `${author.lastName} Family` : 'Deleted User'}
            </div>
            <p className="text-sm" suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
          </div>
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
                {item.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                  {onDeleteClick ? <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>Delete</DropdownMenuItem> : undefined}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {nestedContent}
        </div>
      </div>
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
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}