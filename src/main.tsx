import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";

import DefaultLayout from "@/layouts/DefaultLayout";

import Home from "@/pages/Home";
import Join from "@/pages/Join";
import Room from "@/pages/Room";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/room" element={<Join />} /> */}
          <Route path="/" element={<Join />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
