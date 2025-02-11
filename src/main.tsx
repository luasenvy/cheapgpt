import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "sonner";

import { ChatGPT } from "@/components/ChatGPT";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <main className="flex h-full w-full flex-col">
      <ChatGPT />
    </main>

    <Toaster />
  </React.StrictMode>
);
