import React, { useEffect, useMemo, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import toast from "react-hot-toast";

const todayISO = () => new Date().toISOString().slice(0, 10);

const toDateOnly = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, pageSize: 10 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    sortBy: "date",
    sortOrder: "desc",
    status: "",
    dateFrom: "",
    dateTo: "",
    q: "",
  });
  const [form, setForm] = useState({
    title: "",
    notes: "",
    date: todayISO(),
  });

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await getTasks({
        page: query.page,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        status: query.status || undefined,
        dateFrom: query.dateFrom || undefined,
        dateTo: query.dateTo || undefined,
        q: query.q || undefined,
      });
      const payload = res.data || {};
      setTasks(payload.data || []);
      setMeta(payload.meta || { total: 0, page: 1, totalPages: 1, pageSize: query.pageSize });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.pageSize, query.sortBy, query.sortOrder, query.status, query.dateFrom, query.dateTo, query.q]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const payload = {
        title: form.title.trim(),
        notes: form.notes.trim() || undefined,
        date: form.date || todayISO(),
      };
      await createTask(payload);
      await fetchTasks();
      setForm({
        title: "",
        notes: "",
        date: todayISO(),
      });
      toast.success("Task added");
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error(
        err?.response?.data?.error || "Failed to add task. Please try again."
      );
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "DONE" ? "PENDING" : "DONE";
    try {
      await updateTask(task.id, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await fetchTasks();
      toast.success("Task deleted");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task");
    }
  };

  const last7Days = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-IN", {
        weekday: "short",
      });

      const dayTasks = tasks.filter(
        (t) => toDateOnly(t.date) === iso
      );
      const total = dayTasks.length;
      const done = dayTasks.filter((t) => t.status === "DONE").length;

      result.push({
        date: iso,
        label,
        total,
        done,
      });
    }

    return result;
  }, [tasks]);

  const totalTasks = meta.total;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-slate-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Tasks</h2>
            <p className="text-xs text-slate-400">Capture routines and finish what matters most.</p>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400">Quick add below</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Tasks</h2>
          <p className="text-xs text-slate-400">
            Capture your daily routines and keep track of what you actually
            complete.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60">
            <div className="text-slate-400 uppercase tracking-wide text-[10px]">
              Total tasks
            </div>
            <div className="text-slate-50 font-semibold text-sm">
              {totalTasks}
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
            <div className="text-emerald-300 uppercase tracking-wide text-[10px]">
              Completed
            </div>
            <div className="text-emerald-400 font-semibold text-sm">
              {doneTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Past 7 days strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-50">
              Past 7 days activity
            </h3>
            <p className="text-[11px] text-slate-400">
              Quick view of how many tasks you finished each day.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            Today is{" "}
            <span className="text-slate-200">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day) => {
            const intensity =
              day.done === 0
                ? "bg-slate-800/70 border-slate-700"
                : day.done === 1
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-emerald-500/20 border-emerald-400/60";

            return (
              <div
                key={day.date}
                className={`rounded-xl border px-2 py-2 flex flex-col items-center justify-center gap-1 ${intensity}`}
              >
                <div className="text-[11px] text-slate-300">{day.label}</div>
                <div className="text-xs text-slate-400">
                  {day.total} task{day.total !== 1 && "s"}
                </div>
                <div className="text-[11px] font-semibold text-emerald-300">
                  {day.done} done
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            placeholder="Search title or notes"
            value={query.q}
            onChange={(e) => setQuery((prev) => ({ ...prev, q: e.target.value, page: 1 }))}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none"
          />
          <select
            value={query.status}
            onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={query.dateFrom}
              onChange={(e) => setQuery((prev) => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            />
            <input
              type="date"
              value={query.dateTo}
              onChange={(e) => setQuery((prev) => ({ ...prev, dateTo: e.target.value, page: 1 }))}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={query.sortBy}
              onChange={(e) => setQuery((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            >
              <option value="date">Date</option>
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
            <select
              value={query.sortOrder}
              onChange={(e) => setQuery((prev) => ({ ...prev, sortOrder: e.target.value, page: 1 }))}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <select
            value={query.pageSize}
            onChange={(e) => setQuery((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Add task form */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">
          Add a new task
        </h3>
        <form
          onSubmit={handleAddTask}
          className="grid grid-cols-1 md:grid-cols-[2fr,2fr,0.9fr] gap-3"
        >
          <div>
            <label className="text-[11px] uppercase tracking-wide text-slate-400 mb-1 block">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/70"
              placeholder="What do you want to focus on?"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-slate-400 mb-1 block">
              Notes
            </label>
            <input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/70"
              placeholder="Optional details"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-slate-400 mb-1 block">
              Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-50">
            All tasks ({meta.total})
          </h3>
          <span className="text-[11px] text-slate-500">
            Click on status to toggle done/pending
          </span>
        </div>

        {loadingTasks ? (
          <div className="text-xs text-slate-500 py-6 text-center">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">
            No tasks yet. Start by adding one above.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {tasks.map((task) => {
                const isDone = task.status === "DONE";
                return (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(task)}
                          className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                            isDone
                              ? "bg-emerald-500 border-emerald-400 text-slate-950"
                              : "border-slate-600 text-slate-500"
                          }`}
                        >
                          {isDone ? "✓" : ""}
                        </button>
                        <span
                          className={`text-sm ${
                            isDone
                              ? "text-slate-400 line-through"
                              : "text-slate-50"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-500 ml-6 mt-1">
                          {task.notes}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 ml-6 mt-1">
                        {new Date(task.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                          isDone
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {isDone ? "Done" : "Pending"}
                      </span>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-2 py-1 rounded-full border border-rose-500/60 text-[11px] text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
              <div>
                Page {meta.page} of {meta.totalPages} — {meta.total} total tasks
              </div>
              <div className="flex gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  className="px-3 py-1 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setQuery((prev) => ({ ...prev, page: Math.min(prev.page + 1, meta.totalPages) }))}
                  className="px-3 py-1 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;
