import { ArrowUp, LoaderCircle, X } from "lucide-react";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onChat: (text: string) => void;
  onClear: () => void;
  onSummary: () => void;
  onInputMessage: (text: string) => void;
  onInputImage: (base64?: string) => void;
  text: string;
  image?: string;
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
    onClear: handleClear,
    onSummary: handleSummary,
    onInputMessage: handleInputMessage,
    onInputImage: handleInputImage,
    text,
    image,
    disabled,
    talking,
    ...props
  }: SearchBarProps,
  ref: React.Ref<SearchBarRef>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleClipboardImage = (e: ClipboardEvent) => {
    const clipboard = e.clipboardData;
    if (!clipboard?.files.length) return;

    const [file] = clipboard.files;

    if (!file.type.startsWith("image/")) return;

    renderImage(file);

    e.preventDefault();
  };

  const renderImage = (file: File) => {
    const reader = new FileReader();

    reader.addEventListener("load", (e: ProgressEvent<FileReader>) =>
      handleInputImage(e.target?.result as string)
    );

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.addEventListener("paste", handleClipboardImage);

    inputRef.current?.focus();

    return () => {
      inputRef.current?.removeEventListener("paste", handleClipboardImage);
    };
  }, [inputRef]);

  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      {image && (
        <div className="relative h-full w-20 overflow-hidden rounded-md border-card shadow">
          <div
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          ></div>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0.5 top-0.5 size-5 rounded-full p-0"
            onClick={() => handleInputImage(undefined)}
          >
            <X />
          </Button>
        </div>
      )}

      <Textarea
        ref={inputRef}
        placeholder="Type a message..."
        className="w-full resize-none text-xs"
        disabled={disabled || talking}
        value={text}
        onKeyDown={(e) => {
          if ("L" === e.key && e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            handleClear();
            inputRef.current?.focus();
          } else if ("F" === e.key && e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            handleSummary();
          } else if ("Enter" === e.key && !e.shiftKey) {
            e.preventDefault();
            handleChat(text);
          }
        }}
        onInput={(e) => handleInputMessage(e.currentTarget.value)}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              size="icon"
              variant="outline"
              disabled={!text || disabled || talking}
              className="size-8 flex-shrink-0 rounded-full p-0"
              onClick={() => handleChat(text)}
            >
              {talking ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});
