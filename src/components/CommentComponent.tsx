import { getDateDifferenceString } from "@/utils/dateUtils";
import { PopulatedComment } from "@/utils/types/comment";
import { MessageSquare, Ellipsis, Heart } from "lucide-react";
import { HeartIcon as FilledHeartIcon } from "@heroicons/react/24/solid";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownIt from "markdown-it";
import { ReactNode, useState } from "react";
import colors from "tailwindcss/colors";

type CommentComponentProps = {
  className?: string;
  comment: PopulatedComment;
  onLikeClick?: (liked: boolean) => Promise<void>;
  onReplyClick?: () => void;
  nestedContent?: ReactNode;
};

export default function CommentComponent(props: CommentComponentProps) {
  const mdParser = new MarkdownIt();

  const {
    className = '',
    comment,
    onLikeClick,
    onReplyClick,
    nestedContent
  } = props;
  
  const {
    author,
    content,
    date,
    likes: initialLikes,
    liked: initialLiked
  } = comment;

  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

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

  const bottomRow = [
    { label: likes.toString(), icon: liked ? <Heart className="text-red-500" fill={colors.red[500]} /> : <Heart />, onClick: handleLikeClick },
    { label: 'Reply', icon: <MessageSquare />, onClick: onReplyClick },
    { label: '', icon: <Ellipsis />, onClick: () => {} }
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
                <div className="w-5 h-5 [&>*]:w-full [&>*]:h-full">
                  {item.icon}
                </div>
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