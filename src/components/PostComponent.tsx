'use client'

import { PopulatedPost } from "@/utils/types/post";
import Tag from "./Tag";
import { BookmarkIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import { getDateDifferenceString } from "@/utils/dateUtils";
import MarkdownIt from "markdown-it";
import MarkdownRenderer from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PostComponentProps = {
  post: PopulatedPost;
  className?: string;
  clickable?: boolean;
};

export default function PostComponent({post, className = '', clickable = false}: PostComponentProps) {
  const mdParser = new MarkdownIt({
    html: true,
  });

  // don't render links for clickable components to avoid nested a tags
  if (clickable) {
    mdParser.renderer.rules.link_open = () => '<span class="underline text-gray-900">';
    mdParser.renderer.rules.link_close = () => '</span>';
  }

  const {
    title,
    author,
    content,
    date,
    tags,
    likes,
    comments
  } = post;

  const bottomRow = [
    { label: likes.toString(), Icon: HeartIcon },
    { label: comments.toString(), Icon: ChatBubbleLeftEllipsisIcon },
    { label: 'Save Post', Icon: BookmarkIcon }
  ];

  const reactContent = (
    <>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#D9D9D9] rounded-full inline-block"/>
          {author ? `${author.lastName} Family` : 'Deleted User'}
        </div>
        <p suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="text-2xl text-black font-bold">{title}</h2>
        {
          !clickable && (
            <button>
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
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
            <button>
              <item.Icon className="w-6 h-6" />
            </button>
            {item.label}
          </div>
        ))}
      </div>
    </>
  );

  const classes = cn(
    'flex flex-col gap-2 text-theme-gray rounded-lg',
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