import type { CheckedState } from "@radix-ui/react-checkbox";
import { Save, TriangleAlert } from "lucide-react";
import type { ChatCompletionMessageParam } from "openai/resources";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import type { Model } from "@/components/ModelSelect";
import { model as modelEnum } from "@/components/ModelSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CheapGPTConfiguration() {
  const [organization, setOrganization] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  const [sumLng, setSumLng] = useState("auto");
  const [context, setContext] = useState<CheckedState>(false);
  const [model, setModel] = useState<Model>(modelEnum["gpt-4o-mini"]);
  const [messages, setMessages] = useState<Array<ChatCompletionMessageParam>>([]);

  // Saves options to chrome.storage
  const handleClickSaveConfiguration = async () => {
    await chrome.storage.sync.set({
      organization,
      project,
      apiKey,
      model,
      sumLng,
      messages,
      context,
    });

    toast.success("Options saved.");
  };

  useEffect(() => {
    (async () => {
      const { organization, project, apiKey, model, context, sumLng, messages } =
        await chrome.storage.sync.get([
          "organization",
          "project",
          "apiKey",
          "model",
          "sumLng",
          "context",
          "messages",
        ]);

      setOrganization(organization ?? "");
      setProject(project ?? "");
      setApiKey(apiKey ?? "");
      setContext(context ?? false);
      setModel(model || modelEnum["gpt-4o-mini"]);
      setSumLng(sumLng || "auto");
      setMessages(messages ?? []);
    })();
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Label
          className="w-1/3 text-nowrap text-right font-semibold"
          htmlFor="api-key"
          title="required"
        >
          API Key<span className="text-lg text-primary">*</span>
        </Label>
        <Textarea
          id="api-key"
          required
          placeholder="API Key"
          className="h-28 resize-none"
          value={apiKey}
          onInput={(e) => setApiKey(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-1/3 text-nowrap text-right" htmlFor="org-id">
          Organization ID
        </Label>
        <Input
          id="org-id"
          placeholder="Organization ID"
          value={organization}
          onInput={(e) => setOrganization(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-1/3 text-nowrap text-right" htmlFor="prj-id">
          Project ID
        </Label>
        <Input
          id="prj-id"
          placeholder="Project ID"
          value={project}
          onInput={(e) => setProject(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-1/3 text-nowrap text-right" htmlFor="model">
          Default Model
        </Label>
        <Select value={model} onValueChange={(value) => setModel(value as Model)}>
          <SelectTrigger id="model" className="w-full">
            <SelectValue placeholder="Select Model..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(modelEnum).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-1/3 text-nowrap text-right" htmlFor="model">
          Summary Language
        </Label>
        <Select value={sumLng} onValueChange={setSumLng}>
          <SelectTrigger id="model" className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">detect in content</SelectItem>
            <SelectItem value="한국어">한국어</SelectItem>
            <SelectItem value="English (NA)">English (NA)</SelectItem>
            <SelectItem value="English (EUW)">English (EUW)</SelectItem>
            <SelectItem value="Deutsch">Deutsch</SelectItem>
            <SelectItem value="Español (EUW)">Español (EUW)</SelectItem>
            <SelectItem value="Français">Français</SelectItem>
            <SelectItem value="Italiano">Italiano</SelectItem>
            <SelectItem value="Polski">Polski</SelectItem>
            <SelectItem value="Ελληνικά">Ελληνικά</SelectItem>
            <SelectItem value="Română">Română</SelectItem>
            <SelectItem value="Magyar">Magyar</SelectItem>
            <SelectItem value="Čeština">Čeština</SelectItem>
            <SelectItem value="Español (LATAM)">Español (LATAM)</SelectItem>
            <SelectItem value="Português">Português</SelectItem>
            <SelectItem value="日本語">日本語</SelectItem>
            <SelectItem value="Русский">Русский</SelectItem>
            <SelectItem value="Türkçe">Türkçe</SelectItem>
            <SelectItem value="English (OCE)">English (OCE)</SelectItem>
            <SelectItem value="English (SG)">English (SG)</SelectItem>
            <SelectItem value="English (PH)">English (PH)</SelectItem>
            <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
            <SelectItem value="ภาษาไทย">ภาษาไทย</SelectItem>
            <SelectItem value="繁體中文">繁體中文</SelectItem>
            <SelectItem value="العربية">العربية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="flex w-1/3 items-center justify-end gap-2 text-nowrap" htmlFor="context">
          Maintain Context
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <TriangleAlert className="size-3 cursor-help text-blue-800" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The context will retain the previous 6 conversations.</p>
                <p>
                  It is means <strong>spend more costs.</strong>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>

        <div className="my-1 w-full">
          <Checkbox id="context" checked={context} onCheckedChange={setContext} />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-1/3 text-nowrap text-right"></Label>

        <div className="my-1 w-full">
          <Button
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            variant="outline"
            size="sm"
            onClick={handleClickSaveConfiguration}
            disabled={!apiKey}
          >
            <Save /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
