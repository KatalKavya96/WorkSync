import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { Toaster } from "react-hot-toast";

const navItems = [
  { to: "/", label: "Overview", icon: "📊" },
  { to: "/tasks", label: "Tasks", icon: "📝" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/calendar", label: "Calendar", icon: "📅" },
  { to: "/goals", label: "Goals", icon: "🎯" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
        <div className="px-4 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg">
            W
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide">WorkSync</div>
            <div className="text-[11px] text-slate-400">Work • Tasks • Rhythm</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                  isActive
                    ? "bg-slate-800/80 text-slate-50 ring-1 ring-slate-700 shadow-inner"
                    : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-100",
                ].join(" ")
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-medium tracking-wide">{item.label}</span>
              <span className="ml-auto h-2 w-2 rounded-full bg-slate-700 group-hover:bg-slate-500" />
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 transition"
          >
            Logout / Back to Auth
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-5 bg-slate-950/80 backdrop-blur">
          <div>
            <h1 className="text-sm font-semibold">Dashboard</h1>
            <p className="text-[11px] text-slate-400">
              Overview of your routines, tasks and analysis.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Logged in as <span className="text-slate-200">WorkSync User</span>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-5 py-5">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
