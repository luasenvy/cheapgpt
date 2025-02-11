import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col space-y-2">
      <Input
        placeholder="Open AI Organization ID"
        value={organization}
        onInput={(e) => setOrganization(e.currentTarget.value)}
      />

      <Input
        placeholder="Open AI Project ID"
        value={project}
        onInput={(e) => setProject(e.currentTarget.value)}
      />

      <Input
        placeholder="Open AI API Key"
        value={apiKey}
        onInput={(e) => setApiKey(e.currentTarget.value)}
      />

      <Button
        className="ml-auto bg-blue-500 hover:bg-blue-600"
        variant="default"
        size="icon"
        onClick={handleClickSaveConfiguration}
        disabled={!Boolean(organization) || !Boolean(project) || !Boolean(apiKey)}
      >
        <Save />
      </Button>
    </div>
  );
}
