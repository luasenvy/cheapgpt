import { Save } from "lucide-react";
import type { ChatCompletionMessageParam } from "openai/resources";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import type { Model } from "@/components/ModelSelect";
import { model as modelEnum } from "@/components/ModelSelect";
import { Button } from "@/components/ui/button";
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

export function CheapGPTConfiguration() {
  const [organization, setOrganization] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<Model>(modelEnum["gpt-4o-mini"]);
  const [messages, setMessages] = useState<Array<ChatCompletionMessageParam>>([]);

  // Saves options to chrome.storage
  const handleClickSaveConfiguration = async () => {
    await chrome.storage.sync.set({ organization, project, apiKey, model, messages });

    toast.success("Options saved.");
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

      setOrganization(organization ?? "");
      setProject(project ?? "");
      setApiKey(apiKey ?? "");
      setModel(model || modelEnum["gpt-4o-mini"]);
      setMessages(messages ?? []);
    })();
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap font-semibold" htmlFor="api-key" title="required">
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

      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap" htmlFor="org-id">
          Organization ID
        </Label>
        <Input
          id="org-id"
          placeholder="Organization ID"
          value={organization}
          onInput={(e) => setOrganization(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap" htmlFor="prj-id">
          Project ID
        </Label>
        <Input
          id="prj-id"
          placeholder="Project ID"
          value={project}
          onInput={(e) => setProject(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap" htmlFor="model">
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

      <Button
        className="ml-auto border-primary text-primary hover:bg-primary hover:text-white"
        variant="outline"
        size="icon"
        onClick={handleClickSaveConfiguration}
        disabled={!apiKey}
      >
        <Save />
      </Button>
    </div>
  );
}
