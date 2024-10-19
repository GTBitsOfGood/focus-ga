'use client'

import { PopulatedPost } from "@/utils/types/post";
import Tag from "./Tag";
import { Bookmark, MessageSquare, Ellipsis, Heart } from "lucide-react";
import { getDateDifferenceString } from "@/utils/dateUtils";
import MarkdownIt from "markdown-it";
import MarkdownRenderer from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

type PostComponentProps = {
  className?: string;
  post: PopulatedPost;
  clickable?: boolean;
  onLikeClick?: (liked: boolean) => Promise<void>;
  onSaveClick?: (saved: boolean) => Promise<void>;
  onDeleteClick?: () => Promise<void>;
};

export default function PostComponent(props: PostComponentProps) {
  const mdParser = new MarkdownIt({
    html: true,
  });

  const {
    className = '',
    post,
    clickable = false,
    onLikeClick,
    onSaveClick,
    onDeleteClick
  } = props;

  const {
    title,
    author,
    content,
    date,
    tags,
    likes: initialLikes,
    liked: initialLiked,
    saved: initialSaved,
    comments
  } = post;

  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(initialSaved);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
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

  async function handleSaveClick() {
    if (saveLoading) return;
    setSaved(saved => !saved);

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

  const bottomRow = [
    {
      label: likes.toString(),
      icon: liked ? <Heart className="text-red-500 fill-red-500" /> : <Heart />,
      onClick: likeLoading ? undefined : handleLikeClick
    },
    {
      label: comments.toString(),
      icon: <MessageSquare />
    },
    {
      label: saved ? 'Saved Post' : 'Save Post',
      icon: saved ? <Bookmark className="fill-focus-gray" /> : <Bookmark />,
      onClick: saveLoading ? undefined : handleSaveClick
    }
  ];

  const reactContent = (
    <>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-focus-med-gray rounded-full inline-block"/>
          {author ? `${author.lastName} Family` : 'Deleted User'}
        </div>
        <p suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="text-2xl text-black font-bold">{title}</h2>
        {
          !clickable && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <Ellipsis className="w-6 h-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                {onDeleteClick && <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      </div>
      <MarkdownRenderer
        className={cn("leading-5 text-lg", {"max-h-36 overflow-hidden": clickable})}
        markdown={content}
        parse={markdown => mdParser.render(markdown)}
      />
      <div className={`flex flex-wrap gap-3 ${tags.length > 0 ? 'py-1' : '-my-1'}`}>
        {tags.filter(tag => tag !== null).map(tag => <Tag key={`${post._id}-${tag._id}`} text={tag.name} />)}
      </div>
      <div className="flex items-center pt-2 gap-6">
        {bottomRow.map((item, index) => (
          <div key={`${post._id}-${index}`} className="flex items-center gap-1.5 px-2">
            <button disabled={!item.onClick} onClick={item.onClick}>
              <div className="w-6 h-6 [&>*]:w-full [&>*]:h-full">
                {item.icon}
              </div>
            </button>
            {item.label}
          </div>
        ))}
      </div>
      <AlertDialog open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post?
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

  const classes = cn(
    'flex flex-col gap-2 text-focus-gray rounded-lg',
    clickable && 'cursor-pointer hover:bg-gray-100 p-4',
    className
  );

  return (
    clickable ? (
      <Link
        className={classes}
        href={`/posts/${post._id}`}
      >
      {reactContent}
      </Link>
    ) : (
      <div className={classes}>
        {reactContent}
      </div>
    )
  )
}