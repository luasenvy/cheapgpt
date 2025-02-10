import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "sonner";

import { ChatGPT } from "@/components/ChatGPT";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex h-full w-full flex-col space-y-2 p-2">
      <main className="flex h-full w-full flex-col">
        <ChatGPT />
      </main>

      <Toaster />
    </div>
  </React.StrictMode>
);
