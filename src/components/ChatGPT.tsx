import { Eraser, Gauge, TextSelect } from "lucide-react";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { Stream } from "openai/streaming";
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

type Status = (typeof statusEnum)[keyof typeof statusEnum];

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
  const [sumLng, setSumLng] = useState("auto");

  const appendStream = async ({
    stream,
    virtual,
  }: {
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;
    virtual?: boolean;
  }) => {
    setStatus(statusEnum.talk);

    const lastIndex = messagesRef.current.length - 1;
    for await (const chunk of stream) {
      const lastContent = messagesRef.current[lastIndex].content;

      const { choices, usage } = chunk;

      if (choices?.length) {
        messagesRef.current[lastIndex].content = lastContent + (choices[0].delta.content || "");
      } else if (usage) {
        messagesRef.current[lastIndex].content =
          lastContent + `\n\n*Total ${usage.total_tokens} Tokens*`;
      }

      setMessagesCount((prev) => prev + 1);
    }

    // first element is default message
    if (!virtual) await chrome.storage.sync.set({ messages: messagesRef.current.slice(1) });
  };

  const getSummaryPage = async ({ model, content }: { model: Model; content: string }) => {
    setStatus(statusEnum.think);

    const language = "auto" === sumLng ? `primary language of content` : `${sumLng} language`;
    const summaryPrompt = `Provide a list summarizing into 3 key points, each in less single sentence, each sentence has bold title, presented as ${language}.`;

    const stream = await openaiRef.current!.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: summaryPrompt },
            { type: "text", text: content },
          ],
        },
      ],
      stream: true,
      stream_options: { include_usage: true },
    });

    await appendStream({ stream, virtual: true });

    setStatus(statusEnum.idle);
  };

  const getOpenAIResponse = async ({
    model,
    messages,
  }: {
    model: Model;
    messages: Array<ChatCompletionMessageParam>;
  }) => {
    setStatus(statusEnum.think);

    const stream = await openaiRef.current!.chat.completions.create({
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    });

    await appendStream({ stream });

    setStatus(statusEnum.idle);
  };

  const appendMessage = ({ text, image }: { text: string; image?: string }) => {
    let context = messagesRef.current.slice(1).slice(-6);

    for (let i = 0; i < context.length; i++) {
      if (context[i].role === "user" && context[i].content === "Summary Contents") {
        context = context.toSpliced(i, 2);
        break;
      }
    }

    const message: ChatCompletionMessageParam = { role: "user", content: text };

    if (image) {
      message.content = [
        { type: "text", text },
        { type: "image_url", image_url: { url: image } },
      ];
    }

    const messages = context.concat(message, { role: "assistant", content: "" });
    messagesRef.current = [defaultMessage].concat(messages);
    setMessagesCount((prev) => prev + 1);
    setImage(undefined);
    setText("");

    setTimeout(() => messagePanelRef.current?.toBottom());

    return messages;
  };

  const handleClear = async () => {
    messagesRef.current = [defaultMessage];
    setMessagesCount((prev) => prev + 1);
  };

  const handleChat = async () => {
    if (!apiKey) return toast.error("Please Configure first.");

    const messages = appendMessage({ text, image });
    getOpenAIResponse({ model, messages });
  };

  useEffect(() => {
    (async () => {
      const { organization, project, apiKey, model, sumLng, messages } =
        await chrome.storage.sync.get([
          "organization",
          "project",
          "apiKey",
          "model",
          "sumLng",
          "messages",
        ]);

      setApiKey(apiKey);
      setModel(model);
      setSumLng(sumLng);

      messagesRef.current = [defaultMessage].concat(messages);
      setMessagesCount((prev) => prev + 1);

      if (apiKey) {
        openaiRef.current = new OpenAI({
          organization,
          project,
          apiKey,
          dangerouslyAllowBrowser: true,
        });

        setTimeout(() => {
          messagePanelRef.current?.toBottom();
          searchBarRef.current?.focus();
        });
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

  const handleClickSendCurrentPage = async () => {
    // 현재 활성 탭의 정보를 가져옵니다.
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab && /^https?:\/\//.test(activeTab.url ?? "")) {
        // 활성 탭의 <body> 내용을 가져오는 스크립트를 실행합니다.
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id! },
            func: () => {
              const body = document.createDocumentFragment();
              body.appendChild(document.body.cloneNode(true));

              body
                .querySelectorAll(
                  "style,script,link,iframe,noscript,template,svg,img,video,canvas,object,embed,frame,frameset,button,header,footer"
                )
                .forEach((el) => el.remove());

              return body.textContent
                ?.replace(/[ \t]{2,}/g, " ")
                .replace(/[ \t]\n/g, "\n")
                .replace(/\n{2,}/g, "\n");
            },
          },
          ([{ result: content }]) => {
            if (!content) return;

            appendMessage({ text: "Summary Contents" });

            getSummaryPage({ model, content });
          }
        );
      }
    });
  };

  const handleClickClearMessages = async () => {
    await chrome.storage.sync.set({ messages: [] });
    messagesRef.current = [defaultMessage];
    setMessagesCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (status === statusEnum.idle) searchBarRef.current?.focus();
  }, [status]);
  return (
    <div className={cn("flex h-full w-full flex-col space-y-2", className)} {...props}>
      <div className="flex items-center p-2 pb-0">
        {apiKey && <ModelSelect model={model} onModelSelect={setModel} className="w-30" />}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="ml-2">
              <Button
                variant="outline"
                size="sm"
                className="size-7 rounded-full border-primary p-0 hover:bg-primary hover:text-white"
                onClick={handleClickSendCurrentPage}
              >
                <TextSelect />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Summary Page</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="ml-auto">
              <Button
                variant="secondary"
                size="sm"
                className="size-7 rounded-full p-0 hover:bg-orange-600 hover:text-white"
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
            <TooltipTrigger className="ml-2">
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
        onClear={handleClear}
        onSummary={handleClickSendCurrentPage}
      />
    </div>
  );
}
