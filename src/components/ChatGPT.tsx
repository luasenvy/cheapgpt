import { Eraser, Gauge, Paintbrush, TextSelect } from "lucide-react";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { Stream } from "openai/streaming";
import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import { MessagePanel } from "@/components/MessagePanel";
import type { Model } from "@/components/ModelSelect";
import { model as modelEnum } from "@/components/ModelSelect";
import { ModelSelect } from "@/components/ModelSelect";
import type { SearchBarRef } from "@/components/SearchBar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusEnum = {
  drawing: "drawing",
  think: "think",
  talk: "talk",
  idle: "idle",
} as const;

type Status = (typeof statusEnum)[keyof typeof statusEnum];

const defaultMessage: ChatCompletionMessageParam = {
  role: "assistant",
  content: "How may I assist you?",
};

const numberFormat = new Intl.NumberFormat();

const dalleModel = {
  "DALL·E 2": "dall-e-2",
  "DALL·E 3": "dall-e-3",
} as const;

type DalleModel = (typeof dalleModel)[keyof typeof dalleModel];

const dalle2Size = {
  "256x256": "256x256",
  "512x512": "512x512",
  "1024x1024": "1024x1024",
} as const;

type Dalle2Size = (typeof dalle2Size)[keyof typeof dalle2Size];

const dalle3Size = {
  "1024x1024": "1024x1024",
  "1024x1792": "1024x1792",
  "1792x1024": "1792x1024",
} as const;

type Dalle3Size = (typeof dalle3Size)[keyof typeof dalle3Size];

export function ChatGPT({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [status, setStatus] = useState<Status>(statusEnum.idle);
  const [apiKey, setApiKey] = useState<string>("");

  const dallePromptRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Array<ChatCompletionMessageParam>>([defaultMessage]);
  const [, setMessagesCount] = useState<number>(0);
  const openaiRef = useRef<OpenAI | null>(null);
  const searchBarRef = useRef<SearchBarRef>(null);

  const [selectedDalleModel, setSelectedDalleModel] = useState<DalleModel>(dalleModel["DALL·E 3"]);
  const [selectedDalleSize, setSelectedDalleSize] = useState<Dalle2Size | Dalle3Size>(
    dalle3Size["1024x1024"]
  );
  const [dallePrompt, setDallePrompt] = useState<string>("");
  const [dalleOpen, setDalleOpen] = useState<boolean>(false);

  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<string>();
  const [context, setContext] = useState<boolean>(false);
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
          lastContent + `\n\n> Total ${numberFormat.format(usage.total_tokens)} Tokens`;
      }

      setMessagesCount((prev) => prev + 1);
    }

    // first element is default message
    if (!virtual) {
      try {
        await chrome.storage.sync.set({ messages: messagesRef.current.slice(1) });
      } catch {
        /* ignore */
      }
    }
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
    let prevMessages = messagesRef.current.slice(1).slice(-6);

    for (let i = 0; i < prevMessages.length; i++) {
      if (prevMessages[i].role === "user" && prevMessages[i].content === "Summary Contents") {
        prevMessages = prevMessages.toSpliced(i, 2);
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

    const messages = prevMessages.concat(message, { role: "assistant", content: "" });
    messagesRef.current = [defaultMessage].concat(messages);
    setMessagesCount((prev) => prev + 1);
    setImage(undefined);
    setText("");

    return context ? messages : [message];
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
                  "style,script,link,iframe,noscript,template,svg,img,video,canvas,object,embed,frame,frameset,button,header,footer,aside,nav"
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

  const handleClickGenerateImage = async () => {
    setDalleOpen(false);

    appendMessage({ text: dallePrompt });

    setStatus(statusEnum.drawing);

    const {
      data: [{ url, revised_prompt }],
    } = await openaiRef.current!.images.generate({
      model: selectedDalleModel,
      prompt: dallePrompt,
      size: selectedDalleSize,
      n: 1,
    });

    setStatus(statusEnum.idle);

    messagesRef.current[messagesRef.current.length - 1].content =
      `![Generated Image](${url})\n\n${revised_prompt}`;
    setMessagesCount((prev) => prev + 1);
  };

  useEffect(() => {
    (async () => {
      const { organization, project, apiKey, model, sumLng, messages, context } =
        await chrome.storage.sync.get([
          "organization",
          "project",
          "apiKey",
          "model",
          "sumLng",
          "messages",
          "context",
        ]);

      setApiKey(apiKey);
      setModel(model);
      setSumLng(sumLng);
      setContext(context);

      messagesRef.current = [defaultMessage].concat(messages ?? []);
      setMessagesCount((prev) => prev + 1);

      if (apiKey) {
        openaiRef.current = new OpenAI({
          organization,
          project,
          apiKey,
          dangerouslyAllowBrowser: true,
        });
      } else {
        messagesRef.current = [
          {
            role: "assistant",
            content: `**Please configure your OpenAI API first.** 🫠

> Right click on the extension icon and select "Options". 🛠️`,
          },
        ];
        setMessagesCount((prev) => prev + 1);
      }
    })();
  }, []);

  useEffect(() => {
    if (status === statusEnum.idle) searchBarRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (dalleOpen) setTimeout(() => dallePromptRef.current?.focus());
  }, [dalleOpen]);

  return (
    <div className={cn("flex h-full w-full flex-col", className)} {...props}>
      {apiKey && (
        <div className="flex items-center p-2 shadow-md">
          <ModelSelect model={model} onModelSelect={setModel} className="w-30" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-7 rounded-full p-0"
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
              <TooltipTrigger className="ml-2">
                <Dialog open={dalleOpen} onOpenChange={setDalleOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="size-7 rounded-full p-0"
                      onClick={() => setDalleOpen(true)}
                    >
                      <Paintbrush />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className="hidden">
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-5 items-center gap-4">
                        <Label htmlFor="model" className="text-right text-sm">
                          Model
                        </Label>

                        <Select
                          value={selectedDalleModel}
                          onValueChange={(value) => setSelectedDalleModel(value as DalleModel)}
                        >
                          <SelectTrigger id="model" className="col-span-4">
                            <SelectValue placeholder="Select a fruit" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(dalleModel).map(([name, value]) => (
                              <SelectItem key={value} value={value}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-5 items-center gap-4">
                        <Label htmlFor="size" className="text-right text-sm">
                          Size
                        </Label>

                        <Select
                          value={selectedDalleSize}
                          onValueChange={(value) =>
                            setSelectedDalleSize(value as Dalle2Size | Dalle3Size)
                          }
                        >
                          <SelectTrigger id="size" className="col-span-4">
                            <SelectValue placeholder="Select a fruit" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(
                              dalleModel["DALL·E 2"] === selectedDalleModel
                                ? dalle2Size
                                : dalle3Size
                            ).map(([name, value]) => (
                              <SelectItem key={value} value={value}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-5 items-center gap-4">
                        <Label htmlFor="prompt" className="text-right text-sm">
                          Prompt
                        </Label>
                        <Input
                          ref={dallePromptRef}
                          id="prompt"
                          value={dallePrompt}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              handleClickGenerateImage();
                            }
                          }}
                          onInput={(e) => setDallePrompt(e.currentTarget.value)}
                          placeholder="a white siamese cat"
                          className="col-span-4 resize-none text-sm"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={handleClickGenerateImage}
                        disabled={
                          !Boolean(selectedDalleModel) ||
                          !Boolean(selectedDalleSize) ||
                          !Object.values(
                            selectedDalleModel === dalleModel["DALL·E 2"] ? dalle2Size : dalle3Size
                          ).includes(selectedDalleSize) ||
                          !Boolean(dallePrompt)
                        }
                      >
                        Generate Image
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate Image</p>
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
      )}

      <MessagePanel
        messages={messagesRef.current}
        className="h-full overflow-auto p-2 text-sm"
        thinking={status === statusEnum.think}
        drawing={status === statusEnum.drawing}
      />

      {apiKey && (
        <SearchBar
          ref={searchBarRef}
          disabled={!apiKey}
          talking={status === statusEnum.talk}
          className="flex-shrink-0 p-2"
          text={text}
          image={image}
          onInputMessage={(input) => setText(input)}
          onInputImage={(base64) => setImage(base64)}
          onChat={handleChat}
          onClear={handleClear}
          onSummary={handleClickSendCurrentPage}
          onGenerateImage={() => setDalleOpen(true)}
        />
      )}
    </div>
  );
}
