import React, { useEffect, useMemo, useState } from "react";
import { getTasks } from "../api/tasks";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const toDateOnly = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      const dateFrom = start.toISOString().slice(0, 10);
      const dateTo = now.toISOString().slice(0, 10);
      const res = await getTasks({ dateFrom, dateTo, page: 1, pageSize: 200, sortBy: "date", sortOrder: "asc" });
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching tasks for analytics:", err);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-IN", {
        weekday: "short",
      });

      const dayTasks = tasks.filter((t) => toDateOnly(t.date) === iso);
      const total = dayTasks.length;
      const done = dayTasks.filter((t) => t.status === "DONE").length;

      result.push({
        label,
        total,
        done,
      });
    }

    return result;
  }, [tasks]);

  const totalTasks = weeklyData.reduce((sum, d) => sum + d.total, 0);
  const totalDone = weeklyData.reduce((sum, d) => sum + d.done, 0);
  const completionRate = totalTasks
    ? Math.round((totalDone / totalTasks) * 100)
    : 0;

  let currentStreak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].done > 0) currentStreak++;
    else break;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-slate-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Analytics</h2>
            <p className="text-xs text-slate-400">Visualize weekly consistency and completion trends.</p>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400">7-day overview</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Tasks completed
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-50">
            {loading ? "—" : totalDone}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Out of {loading ? "—" : totalTasks} tasks in last 7 days
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Completion rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-400">
            {loading ? "—" : `${completionRate}%`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Done / Total tasks
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Streak
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-400">
            {loading ? "—" : `${currentStreak}d`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Consecutive days with completed tasks
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-50">
              Tasks completed per day
            </h3>
            <p className="text-[11px] text-slate-400">
              How many tasks you&apos;re finishing each day this week.
            </p>
          </div>
        </div>

        <div className="h-60 min-w-0">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: "0.75rem",
                    fontSize: "11px",
                    color: "#e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="done"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-50">
              Total vs completed
            </h3>
            <p className="text-[11px] text-slate-400">
              Compare how many tasks you planned versus how many you completed.
            </p>
          </div>
        </div>

        <div className="h-60">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: "0.75rem",
                    fontSize: "11px",
                    color: "#e5e7eb",
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#4b5563"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="done"
                  name="Done"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
