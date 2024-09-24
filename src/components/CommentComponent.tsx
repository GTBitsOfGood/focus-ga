import { getDateDifferenceString } from "@/utils/dateUtils";
import { Comment } from "@/utils/types/comment";
import { ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";

type CommentComponentProps = {
  className?: string;
  comment: Comment;
  authorName: string;
};

export default function CommentComponent(props: CommentComponentProps) {
  const className = props.className || '';
  const authorName = props.authorName;
  const {
    content,
    date,
    likes
  } = props.comment;

  const bottomRow = [
    { label: likes.toString(), Icon: HeartIcon },
    { label: 'Reply', Icon: ChatBubbleLeftEllipsisIcon },
    { label: '', Icon: EllipsisHorizontalIcon }
  ];

  return (
    <div className="flex gap-2.5">
      <div>
        <span className="w-6 h-6 bg-[#D9D9D9] rounded-full inline-block"/>
      </div>
      <div className={`flex-grow flex flex-col gap-2 text-[#636363] ${className}`}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-black">
            {authorName}
          </div>
          <p className="text-sm" suppressHydrationWarning>{getDateDifferenceString(new Date(), date)}</p>
        </div>
        <p className="leading-5">
          {content}
        </p>
        <div className="flex items-center pt-2 gap-6 text-sm">
          {bottomRow.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 px-1">
              <button>
                <item.Icon className="w-5 h-5" />
              </button>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}