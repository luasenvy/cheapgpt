import OpenAI from "openai";
import { useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import type { Message } from "@/components/MessagePanel";
import { MessagePanel } from "@/components/MessagePanel";
import type { SearchBarRef } from "@/components/SearchBar";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/utils";

export function ChatGPT({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [organization, setOrganization] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  const [messages, setMessages] = useState<Array<Message>>([
    {
      role: "assistant",
      content: "How may I assist you?",
    },
  ]);

  const openaiRef = useRef<OpenAI | null>(null);
  const searchBarRef = useRef<SearchBarRef>(null);

  const [text, setText] = useState<string>("");
  const [isTalking, setIsTalking] = useState<boolean>(false);

  const isChattable = useMemo(
    () => Boolean(organization) && Boolean(project) && Boolean(apiKey),
    [organization, project, apiKey]
  );

  const handleChat = async () => {
    if (!isChattable) return toast.error("Please Configure first.");

    const message: Message = { role: "user", content: text };
    setMessages((prev) => Array.from(prev).concat(message, { role: "assistant", content: "" }));

    setIsTalking(true);
    const stream = await openaiRef.current!.chat.completions.create({
      model: "gpt-4o",
      messages: [message],
      stream: true,
    });

    setText("");

    for await (const chunk of stream) {
      setMessages((prev) => {
        {
          const [{ role: lastRole, content: lastMessage }, ...messages] = prev.toReversed();

          return Array.from(messages).concat({
            role: lastRole,
            content: lastMessage + (chunk.choices[0]?.delta?.content || ""),
          });
        }
      });
    }

    setIsTalking(false);
  };

  useEffect(() => {
    if (!isTalking) searchBarRef.current?.focus();
  }, [isTalking]);

  useEffect(() => {
    chrome.storage.sync.get(
      { organization, project, apiKey },
      ({ organization, project, apiKey }) => {
        setOrganization(organization);
        setProject(project);
        setApiKey(apiKey);

        if (Boolean(organization) && Boolean(project) && Boolean(apiKey)) {
          openaiRef.current = new OpenAI({
            organization,
            project,
            apiKey,
            dangerouslyAllowBrowser: true,
          });

          searchBarRef.current?.focus();
        }
      }
    );
  }, []);

  return (
    <div className={cn("flex h-full w-full flex-col space-y-2", className)} {...props}>
      <MessagePanel
        messages={messages}
        className="h-full overflow-auto"
        thinking={isTalking && Boolean(text)}
      />
      <SearchBar
        ref={searchBarRef}
        disabled={!isChattable}
        talking={isTalking}
        className="flex-shrink-0"
        text={text}
        onInputMessage={(input) => setText(input)}
        onChat={handleChat}
      />
    </div>
  );
}
