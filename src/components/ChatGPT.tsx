import { Eraser, Gauge } from "lucide-react";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import type { MessagePanelRef } from "@/components/MessagePanel";
import { MessagePanel } from "@/components/MessagePanel";
import type { Model } from "@/components/ModelSelect";
import { model as modelEnum } from "@/components/ModelSelect";
import { ModelSelect } from "@/components/ModelSelect";
import type { SearchBarRef } from "@/components/SearchBar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusEnum = {
  think: "think",
  talk: "talk",
  idle: "idle",
} as const;

type Status = (typeof status)[keyof typeof status];

const defaultMessage: ChatCompletionMessageParam = {
  role: "assistant",
  content: "How may I assist you?",
};

export function ChatGPT({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [status, setStatus] = useState<Status>(statusEnum.idle);
  const [apiKey, setApiKey] = useState<string>("");

  const messagesRef = useRef<Array<ChatCompletionMessageParam>>([defaultMessage]);
  const [, setMessagesCount] = useState<number>(0);
  const openaiRef = useRef<OpenAI | null>(null);
  const messagePanelRef = useRef<MessagePanelRef>(null);
  const searchBarRef = useRef<SearchBarRef>(null);

  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<string>();
  const [model, setModel] = useState<Model>(modelEnum["gpt-4o-mini"]);

  const handleChat = async () => {
    if (!apiKey) return toast.error("Please Configure first.");

    messagePanelRef.current?.toBottom();

    const context = messagesRef.current.slice(1).slice(-6);
    const message: ChatCompletionMessageParam = { role: "user", content: text };

    if (image) {
      message.content = [
        { type: "text", text },
        { type: "image_url", image_url: { url: image } },
      ];
    }

    messagesRef.current = Array.from(messagesRef.current).concat(message, {
      role: "assistant",
      content: "",
    });
    setMessagesCount((prev) => prev + 1);
    setImage(undefined);
    setText("");

    setStatus(statusEnum.think);
    const stream = await openaiRef.current!.chat.completions.create({
      model,
      messages: context.concat(message),
      stream: true,
    });

    setStatus(statusEnum.talk);
    for await (const chunk of stream) {
      const [{ role: lastRole, content: lastMessage }, ...messages] =
        messagesRef.current.toReversed();

      messagesRef.current = Array.from(messages.toReversed()).concat({
        role: lastRole,
        content: lastMessage + (chunk.choices[0]?.delta?.content || ""),
      } as ChatCompletionMessageParam);
      setMessagesCount((prev) => prev + 1);
    }

    await chrome.storage.sync.set({ messages: messagesRef.current });
    setMessagesCount((prev) => prev + 1);

    setStatus(statusEnum.idle);
  };

  useEffect(() => {
    (async () => {
      const { organization, project, apiKey, model, messages } = await chrome.storage.sync.get([
        "organization",
        "project",
        "apiKey",
        "model",
        "messages",
      ]);

      setApiKey(apiKey);
      setModel(model);

      messagesRef.current = messages?.length ? messages : [defaultMessage];
      setMessagesCount((prev) => prev + 1);

      if (apiKey) {
        openaiRef.current = new OpenAI({
          organization,
          project,
          apiKey,
          dangerouslyAllowBrowser: true,
        });

        setTimeout(() => searchBarRef.current?.focus());
      } else {
        messagesRef.current = [
          {
            role: "assistant",
            content: `**Please configure your OpenAI API first.** 🫠

> Right click on the extension icon and select "Options". 🛠️
            `,
          },
        ];
        setMessagesCount((prev) => prev + 1);
      }
    })();
  }, []);

  const handleClickClearMessages = async () => {
    await chrome.storage.sync.set({ messages: [] });
    messagesRef.current = [defaultMessage];
    setMessagesCount((prev) => prev + 1);
  };

  return (
    <div className={cn("flex h-full w-full flex-col space-y-2", className)} {...props}>
      <div className="flex items-center p-2 pb-0">
        {apiKey && <ModelSelect model={model} onModelSelect={setModel} />}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="ml-2">
              <Button
                variant="destructive"
                size="sm"
                className="size-7 rounded-full p-0"
                onClick={handleClickClearMessages}
              >
                <Eraser />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Messages</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="ml-auto size-7 rounded-full p-0"
                asChild
              >
                <a href="https://platform.openai.com/settings/organization/usage" target="_blank">
                  <Gauge />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open AI API Usage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <MessagePanel
        ref={messagePanelRef}
        messages={messagesRef.current}
        className="h-full overflow-auto p-2 text-sm"
        thinking={status === statusEnum.think}
      />

      <SearchBar
        ref={searchBarRef}
        disabled={!apiKey}
        talking={status === statusEnum.talk}
        className="flex-shrink-0 p-2 pt-0"
        text={text}
        image={image}
        onInputMessage={(input) => setText(input)}
        onInputImage={(base64) => setImage(base64)}
        onChat={handleChat}
      />
    </div>
  );
}
