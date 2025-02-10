import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { CheapGPTConfiguration } from "@/components/CheapGPTConfiguration";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="container max-w-screen-sm p-2 md:mx-auto">
      <header>
        <h1 className="text-lg font-semibold">CheapGPT Configuration</h1>
      </header>

      <main className="flex-grow py-2">
        <CheapGPTConfiguration />
        <Toaster />
      </main>
      {/* <footer>footer</footer> */}
    </div>
  </React.StrictMode>
);
