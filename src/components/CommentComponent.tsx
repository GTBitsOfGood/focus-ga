import { getDateDifferenceString } from "@/utils/dateUtils";
import { PopulatedComment } from "@/utils/types/comment";
import { ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownIt from "markdown-it";
import { ReactNode } from "react";

type CommentComponentProps = {
  className?: string;
  comment: PopulatedComment;
  onReplyClick?: () => void;
  nestedContent?: ReactNode;
};

export default function CommentComponent(props: CommentComponentProps) {
  const mdParser = new MarkdownIt();

  const {
    className = '',
    comment,
    onReplyClick,
    nestedContent
  } = props;
  
  const {
    author,
    content,
    date,
    likes
  } = comment;

  const bottomRow = [
    { label: likes.toString(), Icon: HeartIcon, onClick: () => {} },
    { label: 'Reply', Icon: ChatBubbleLeftEllipsisIcon, onClick: onReplyClick },
    { label: '', Icon: EllipsisHorizontalIcon, onClick: () => {} }
  ];

  return (
    <div className="flex gap-2.5">
      <div>
        <span className="w-6 h-6 bg-[#D9D9D9] rounded-full inline-block"/>
      </div>
      <div className={`flex-grow flex flex-col gap-2 text-[#636363] ${className}`}>
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
          {bottomRow.map((item, index) => item.onClick && (
            <div key={index} className="flex items-center gap-1.5 px-1">
              <button onClick={item.onClick}>
                <item.Icon className="w-5 h-5" />
              </button>
              {item.label}
            </div>
          ))}
        </div>
        {nestedContent}
      </div>
    </div>
  );
}