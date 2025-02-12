import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CheapGPTConfiguration() {
  const [organization, setOrganization] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  // Saves options to chrome.storage
  const handleClickSaveConfiguration = () => {
    chrome.storage.sync.set({ organization, project, apiKey }, () =>
      toast.success("Options saved.")
    );
  };

  useEffect(() => {
    chrome.storage.sync.get(
      { organization, project, apiKey },
      ({ organization, project, apiKey }) => {
        setOrganization(organization);
        setProject(project);
        setApiKey(apiKey);
      }
    );
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap">Organization ID</Label>
        <Input
          placeholder="Organization ID"
          value={organization}
          onInput={(e) => setOrganization(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap">Project ID</Label>
        <Input
          placeholder="Project ID"
          value={project}
          onInput={(e) => setProject(e.currentTarget.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label className="w-1/3 text-nowrap">API Key</Label>
        <Textarea
          placeholder="API Key"
          className="h-28 resize-none"
          value={apiKey}
          onInput={(e) => setApiKey(e.currentTarget.value)}
        />
      </div>

      <Button
        className="ml-auto border-primary text-primary hover:bg-primary hover:text-white"
        variant="outline"
        size="icon"
        onClick={handleClickSaveConfiguration}
        disabled={!Boolean(organization) || !Boolean(project) || !Boolean(apiKey)}
      >
        <Save />
      </Button>
    </div>
  );
}
