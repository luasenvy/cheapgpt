import React from "react";
import ReactDOM from "react-dom/client";

import DefaultLayout from "@/layouts/DefaultLayout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DefaultLayout>
      <div className="mx-auto flex h-full max-w-4xl flex-col px-6 lg:px-8">
        <div className="my-auto">
          <h1 className="text-balance break-keep text-center text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
            Video{" "}
            <span className="bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text px-2 text-transparent">
              Conference
            </span>
          </h1>

          <div className="mx-auto my-16 flex w-full max-w-screen-sm space-x-1"></div>
        </div>
      </div>
    </DefaultLayout>
  </React.StrictMode>
);
