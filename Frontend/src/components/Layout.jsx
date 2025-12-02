import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const navItems = [
  { to: "/", label: "Overview", icon: "📊" },
  { to: "/tasks", label: "Tasks", icon: "📝" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
];

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <aside className="w-60 border-r border-slate-800 bg-slate-950/90 backdrop-blur flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            W
          </div>
          <div>
            <div className="font-semibold text-sm">WorkSync</div>
            <div className="text-[11px] text-slate-400">
              Work • Tasks • Rhythm
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition",
                  isActive
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                ].join(" ")
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
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
