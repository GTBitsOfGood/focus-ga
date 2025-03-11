import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect } from "react";

type CommentInputComponentProps = {
  className?: string;
  placeholder?: string;
  onSubmit: (value: string) => Promise<void>;
  focusFlag?: boolean;
  setFocusCommentInput?: (state: boolean) => void;
};

export default function CommentInputComponent(
  props: CommentInputComponentProps,
) {
  const {
    className = "",
    placeholder = "",
    onSubmit,
    focusFlag,
    setFocusCommentInput,
  } = props;
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusFlag) {
      inputRef.current?.focus();
    }
  }, [focusFlag]);

  const onBlur = () => {
    if (setFocusCommentInput) {
      setFocusCommentInput(false);
    }
  };

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);

    try {
      setValue("");
      await onSubmit(value);
    } catch (err) {}

    setLoading(false);
  }

  return (
    <div
      className={`flex items-center rounded-full bg-theme-lightgray ${className}`}
    >
      <input
        className="flex-grow select-none bg-transparent py-2 pl-5 pr-3 text-black outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() !== "" && handleSubmit()}
        ref={inputRef}
        onBlur={onBlur}
      />
      <button onClick={handleSubmit} disabled={ value.trim() === ""}>
        <PaperAirplaneIcon
          className="mr-4 h-6 w-6"
          color={value.trim() === "" ? "#C7C7C7" : "#475CC6"}
        />
      </button>
    </div>
  );
}
