import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics"; // 👈 new

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
