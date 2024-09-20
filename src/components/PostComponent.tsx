'use client'

import { Post } from "@/utils/types/post";
import Tag from "./Tag";
import { BookmarkIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import { getDateDifferenceString } from "@/utils/dateUtils";

type PostComponentProps = {
  className?: string;
  post: Post;
  authorName: string;
};

export default function PostComponent(props: PostComponentProps) {
  const className = props.className || '';
  const authorName = props.authorName;
  const {
    title,
    content,
    date,
    tags,
    likes,
    comments
  } = props.post;

  const bottomRow = [
    { label: likes.toString(), Icon: HeartIcon },
    { label: comments.toString(), Icon: ChatBubbleLeftEllipsisIcon },
    { label: 'Save Post', Icon: BookmarkIcon }
  ];

  return (
    <div className={`flex flex-col gap-2 text-[#636363] ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#D9D9D9] rounded-full inline-block"/>
          {authorName}
        </div>
        <p>{getDateDifferenceString(new Date(), date)}</p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <h2 className="text-xl text-black font-bold">{title}</h2>
        <button>
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="leading-5">
        {content}
      </p>
      <div className="flex py-1 gap-3">
        {tags.map(tag => <Tag key={tag} text={tag} />)}
      </div>
      <div className="flex items-center pt-2 gap-6">
        {bottomRow.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 px-2">
            <item.Icon className="w-6 h-6" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}