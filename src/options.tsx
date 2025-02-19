import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { CheapGPTAbout } from "@/components/CheapGPTAbout";
import { CheapGPTConfiguration } from "@/components/CheapGPTConfiguration";
import { CheapGPTShortcut } from "@/components/CheapGPTShortcut";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="container max-w-screen-sm p-2 md:mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">CheapGPT Settings</h1>
      </header>

      <main className="flex-grow">
        <CheapGPTConfiguration />

        <div className="my-8 h-[1px] bg-gradient-to-r from-[#D247BF] to-primary"></div>

        <CheapGPTShortcut />

        <div className="my-8 h-[1px] bg-gradient-to-r from-[#D247BF] to-primary"></div>

        <CheapGPTAbout />
      </main>

      <Toaster />
    </div>
  </React.StrictMode>
);
