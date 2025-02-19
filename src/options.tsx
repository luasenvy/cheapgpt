import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { CheapGPTAbout } from "@/components/CheapGPTAbout";
import { CheapGPTConfiguration } from "@/components/CheapGPTConfiguration";
import { CheapGPTShortcut } from "@/components/CheapGPTShortcut";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="container max-w-screen-sm p-2 md:mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">CheapGPT Settings</h1>
      </header>

      <main className="flex-grow">
        <Accordion type="multiple" className="mt-4 w-full" defaultValue={["configurations"]}>
          <AccordionItem value="configurations">
            <AccordionTrigger>
              <h2 className="text-lg font-semibold">Configurations</h2>
            </AccordionTrigger>
            <AccordionContent>
              <CheapGPTConfiguration />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shortcuts">
            <AccordionTrigger>
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            </AccordionTrigger>
            <AccordionContent>
              <CheapGPTShortcut />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cheapgpt">
            <AccordionTrigger>
              <h2 className="text-lg font-semibold">
                <span className="bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text text-transparent">
                  Thank You
                </span>{" "}
                for Using CheapGPT
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <CheapGPTAbout />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <Toaster />
    </div>
  </React.StrictMode>
);
