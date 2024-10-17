import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

type CommentInputComponentProps = {
  className?: string;
  placeholder?: string;
  onSubmit: (value: string) => Promise<void>;
}; 

export default function CommentInputComponent(props: CommentInputComponentProps) {
  const { className = '', placeholder = '', onSubmit } = props;
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);

    try {
      await onSubmit(value);
      setValue('');
    } catch (err) {}

    setLoading(false);
  }

  return (
    <div className={`flex items-center bg-[#F3F3F3] rounded-full ${className}`}>
      <input
        className="flex-grow pl-5 pr-3 py-2 bg-transparent outline-none select-none text-black"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value !== '' && handleSubmit()}
      />
      <button className={value === '' ? 'hidden' : ''} onClick={handleSubmit}>
        <PaperAirplaneIcon className="w-6 h-6 text-blue mr-4" />
      </button>
    </div>
  );
}