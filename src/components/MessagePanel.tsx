import "highlight.js/styles/monokai-sublime.css";

import { useEffect, useRef } from "react";
import Markdown from "react-markdown";

import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessagePanelProps extends React.HTMLAttributes<HTMLUListElement> {
  messages: Array<Message>;
  thinking: boolean;
}

export function MessagePanel({ messages, className, thinking, ...props }: MessagePanelProps) {
  const ulRef = useRef<HTMLUListElement>(null);
  const others = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (!ulRef.current) return;

    // MutationObserver 인스턴스를 생성하고, 설정 객체를 전달합니다.
    const mutationObserver = new MutationObserver(() =>
      ulRef.current!.scrollTo(0, ulRef.current!.scrollHeight)
    );

    // 대상 요소에 대한 감시를 시작합니다.
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
    <ul ref={ulRef} className={cn("flex flex-col space-y-2 overflow-auto", className)} {...props}>
      {others.map(({ role, content }, index) => (
        <li
          key={index}
          className={cn("flex", {
            "justify-end": "user" === role,
            "border-b pb-2": "assistant" === role,
          })}
        >
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className={cn(`break-words p-2`, {
              "rounded-lg bg-teal-200": "user" === role,
            })}
          >
            {content}
          </Markdown>
        </li>
      ))}

      {thinking ? (
        <div
          className={cn(`w-full break-words p-2`, {
            "rounded-lg bg-teal-200": "user" === lastMessage.role,
          })}
        >
          <p>thinking ...</p>
        </div>
      ) : (
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          className={cn(`w-full break-words p-2`, {
            "rounded-lg bg-teal-200": "user" === lastMessage.role,
          })}
        >
          {lastMessage.content}
        </Markdown>
      )}
    </ul>
  );
}
