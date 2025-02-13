import "highlight.js/styles/monokai-sublime.css";
import "@/styles/prose.css";

import { BotMessageSquare, Disc3 } from "lucide-react";
import type { ChatCompletionMessageParam } from "openai/resources";
import { Fragment, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Markdown from "react-markdown";

import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MessagePanelProps extends React.HTMLAttributes<HTMLUListElement> {
  messages: Array<ChatCompletionMessageParam>;
  thinking: boolean;
}

const userBalloon =
  "relative rounded-lg bg-teal-200/20 px-2 py-1 after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-b-4 after:border-l-4 after:border-t-4 after:border-b-transparent after:border-l-teal-200/20 after:border-t-transparent [&>blockquote>p]:first-letter:!ml-0 [&>p:last-child]:!mb-0 [&>p]:first-letter:!ml-0 mt-4 [&>p>code]:bg-card";

function renderMessage(content: ChatCompletionMessageParam["content"]) {
  if ("string" === typeof content) return content;

  if (Array.isArray(content)) {
    const markdown = content
      .toSorted(({ type: b }) => ("image_url" === b ? -1 : 0))
      .map((item) => {
        if ("text" === item.type) return `${item.text}\n`;
        if ("image_url" === item.type) return `![Clipboard Image](${item.image_url.url})\n`;
      })
      .filter(Boolean)
      .join("\n");

    console.info(markdown);
    return markdown;
  }

  return null;
}

export interface MessagePanelRef {
  toBottom: () => void;
}

export const MessagePanel = forwardRef(function (
  { messages, className, thinking, ...props }: MessagePanelProps,
  ref: React.Ref<MessagePanelRef>
) {
  const ulRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => ({
    toBottom: () => ulRef.current?.scrollTo(0, ulRef.current.scrollHeight),
  }));

  const others = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (!ulRef.current) return;

    const mutationObserver = new MutationObserver(() => {
      const ul = ulRef.current!;

      const { clientHeight, scrollTop, scrollHeight } = ul;
      if (clientHeight + scrollTop + 80 >= scrollHeight) ul.scrollTo(0, scrollHeight);
    });

    mutationObserver.observe(ulRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [ulRef]);

  return (
    <ul ref={ulRef} className={cn("flex flex-col overflow-auto", className)} {...props}>
      {others.map(({ role, content }, index) => (
        <Fragment key={index}>
          <li
            className={cn({
              "mb-4 flex justify-end": "user" === role,
              "mb-2": "assistant" === role,
            })}
          >
            {"assistant" === role && (
              <div className="flex items-center space-x-2">
                <BotMessageSquare className="size-5 flex-shrink-0" />
                <div className="h-[1px] flex-grow bg-gradient-to-r from-[#D247BF] to-primary"></div>
              </div>
            )}

            <Markdown
              urlTransform={(url) => url}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              className={cn(`prose max-w-full break-words`, {
                [userBalloon]: "user" === role,
                "mt-2 w-full": "assistant" === role,
              })}
            >
              {renderMessage(content)}
            </Markdown>
          </li>
        </Fragment>
      ))}

      <li className={cn({ "flex justify-end": "user" === lastMessage.role })}>
        {"assistant" === lastMessage.role && (
          <div className="flex items-center space-x-2">
            <BotMessageSquare className="size-5 flex-shrink-0" />
            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#D247BF] to-primary"></div>
          </div>
        )}

        {thinking ? (
          <div className="flex items-center justify-center gap-2">
            <Disc3 className="size-5 animate-spin text-primary" />
            <p className="bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text text-transparent">
              thinking ...
            </p>
          </div>
        ) : (
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className={cn(`prose max-w-full break-words`, {
              [userBalloon]: "user" === lastMessage.role,
              "mt-2 w-full": "assistant" === lastMessage.role,
            })}
          >
            {renderMessage(lastMessage.content)}
          </Markdown>
        )}
      </li>
    </ul>
  );
});
