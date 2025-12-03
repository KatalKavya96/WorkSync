import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getTasks } from "../api/tasks";

const Home = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, done: 0 });

  const fetchData = async (token, refreshed) => {
    try {
      const raw = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: token,
        },
      });

      if (!raw.ok) {
        throw new Error(raw.statusText || "Failed to fetch user");
      }

      const data = await raw.json();
      setUser(data);
    } catch (err) {
      console.log("Error fetching user:", err);
      if (!refreshed) {
        refreshToken();
      } else {
        toast.error(err.message || "Failed to load user");
      }
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }
    try {
      const raw = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!raw.ok) {
        throw new Error(raw.statusText || "Failed to refresh token");
      }

      const data = await raw.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      fetchData(data.token, true);
    } catch (err) {
      console.log("Error refreshing token:", err);
      toast.error(err.message || "Session expired, please login again");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are logged out");
      window.location.href = "/auth";
      return;
    }

    fetchData(token, false);
    // Fetch stats via backend meta totals
    (async () => {
      try {
        const allRes = await getTasks({ page: 1, pageSize: 1 });
        const allMeta = allRes.data?.meta || { total: 0 };
        const doneRes = await getTasks({ status: "DONE", page: 1, pageSize: 1 });
        const doneMeta = doneRes.data?.meta || { total: 0 };
        setStats({ total: allMeta.total || 0, done: doneMeta.total || 0 });
      } catch (err) {
        console.log("Error fetching overview stats:", err);
      }
    })();
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {user && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Welcome back, {user.name}</h2>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
              <div className="hidden sm:block text-[11px] text-slate-400">Overview of your activity</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Total tasks</div>
              <div className="mt-2 text-2xl font-semibold text-slate-50">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Completed</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-400">{stats.done}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Completion rate</div>
              <div className="mt-2 text-2xl font-semibold text-sky-400">
                {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
