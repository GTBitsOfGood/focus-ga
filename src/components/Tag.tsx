type TagProps = {
    className?: string;
    text: string;
  };
  
export default function Tag(props: TagProps) {
return (
    <div className={`rounded-full text-sm text-[#636363] px-4 py-0.5 bg-[#D6F4F4] outline outline-1 outline-[#3AC0C1] ${props.className || ''}`}>
    {props.text}
    </div>
);
}