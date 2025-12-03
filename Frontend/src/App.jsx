import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics"; // new
import Calendar from "./pages/Calendar";
import Projects from "./pages/Projects";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="projects" element={<Projects />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
