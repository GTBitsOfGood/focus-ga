'use client'

import { PopulatedPost } from "@/utils/types/post";
import Tag from "./Tag";
import { BookmarkIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import { getDateDifferenceString } from "@/utils/dateUtils";
import { useRouter } from "next/navigation";
import MarkdownIt from "markdown-it";
import MarkdownRenderer from "./MarkdownRenderer";

type PostComponentProps = {
  className?: string;
  post: PopulatedPost;
  clickable?: boolean;
};

export default function PostComponent(props: PostComponentProps) {
  const mdParser = new MarkdownIt();
  const router = useRouter();

  const { className = '', post, clickable = false } = props;
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

  return (
    <div
      className={`flex flex-col gap-2 text-[#636363] ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={clickable ? () => router.push(`/posts/${post._id}`) : undefined}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#D9D9D9] rounded-full inline-block"/>
          {author ? `${author.lastName} Family` : 'Deleted User'}
        </div>
        <p suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="text-2xl text-black font-bold">{title}</h2>
        <button>
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
      </div>
      <MarkdownRenderer
        className="leading-5 text-lg"
        markdown={content}
        parse={markdown => mdParser.render(markdown)}
      />
      <div className={`flex gap-3 ${tags.length > 0 ? 'py-1' : '-my-1'}`}>
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
    </div>
  );
}