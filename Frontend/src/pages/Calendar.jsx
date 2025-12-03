import React, { useEffect, useMemo, useState } from "react";
import { getTasks } from "../api/tasks";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n) => String(n).padStart(2, "0");
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const Calendar = () => {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { start, end } = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return { start, end };
  }, [month]);

  const fetchMonthTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks({
        dateFrom: toYMD(start),
        dateTo: toYMD(end),
        page: 1,
        pageSize: 500,
        sortBy: "date",
        sortOrder: "asc",
      });
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching calendar tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const grid = useMemo(() => {
    const firstDayIndex = start.getDay();
    const daysInMonth = end.getDate();
    const cells = [];

    // previous month pad
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    // current month days
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to complete rows to 6 weeks
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [start, end]);

  const byDay = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = toYMD(new Date(t.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    return map;
  }, [tasks]);

  const monthLabel = useMemo(() => {
    return month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }, [month]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-slate-800 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">Calendar</h2>
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <div className="text-sm text-slate-200">{monthLabel}</div>
            <button
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">Browse tasks by day. Data pulls from backend with date filters.</p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d} className="text-[11px] text-slate-400 text-center uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {grid.map((day, idx) => {
            const dateStr = day ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(day)}` : null;
            const items = day ? byDay.get(dateStr) || [] : [];
            const isToday = day && toYMD(new Date()) === dateStr;
            return (
              <div
                key={idx}
                className={`min-h-24 rounded-xl bg-slate-950 border transition relative ${
                  isToday ? "border-indigo-500" : "border-slate-800"
                }`}
              >
                <span className="absolute top-2 left-2 text-[10px] text-slate-500">{day ?? ""}</span>
                <div className="p-2 space-y-1">
                  {items.slice(0, 4).map((t) => (
                    <div key={t.id} className="text-[11px] truncate rounded-lg px-2 py-1 border border-slate-700 bg-slate-900 text-slate-200">
                      {t.title}
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div className="text-[10px] text-slate-500">+{items.length - 4} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {loading && (
          <div className="text-xs text-slate-500 py-4 text-center">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
