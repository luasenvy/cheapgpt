import { ArrowUp, LoaderCircle } from "lucide-react";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onChat: (text: string) => void;
  onInputMessage: (text: string) => void;
  text: string;
  disabled: boolean;
  talking: boolean;
}

export interface SearchBarRef {
  focus: () => void;
}

export const SearchBar = forwardRef(function (
  {
    className,
    onChat: handleChat,
    onInputMessage: handleInputMessage,
    text,
    disabled,
    talking,
    ...props
  }: SearchBarProps,
  ref: React.Ref<SearchBarRef>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <Textarea
        ref={inputRef}
        placeholder="Type a message..."
        className="w-full resize-none text-xs"
        disabled={disabled || talking}
        value={text}
        onKeyDown={(e) => {
          if ("Enter" === e.key && !e.shiftKey) {
            e.preventDefault();
            handleChat(text);
          }
        }}
        onInput={(e) => handleInputMessage(e.currentTarget.value)}
      />

      <Button
        size="icon"
        variant="outline"
        disabled={disabled || talking}
        className="size-8 flex-shrink-0 rounded-full"
        onClick={() => handleChat(text)}
      >
        {talking ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
      </Button>
    </div>
  );
});
