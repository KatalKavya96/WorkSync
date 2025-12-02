// src/components/TasksSection.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

const TasksSection = () => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "PENDING",
  });

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error("Error loading tasks:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "PENDING",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateTask(editingId, form);
        toast.success("Task updated");
      } else {
        await createTask(form);
        toast.success("Task created");
      }
      resetForm();
      await loadTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id || task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "PENDING",
    });
  };

  const handleDelete = async (task) => {
    const id = task.id || task._id;
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(id);
      toast.success("Task deleted");
      await loadTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete task"
      );
    }
  };

  const handleToggleStatus = async (task) => {
    const id = task.id || task._id;
    if (!id) return;

    const newStatus =
      task.status === "DONE" || task.completed || task.isDone
        ? "PENDING"
        : "DONE";

    setSaving(true);
    try {
      await updateTask(id, {
        ...task,
        status: newStatus,
      });
      await loadTasks();
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 p-5 shadow-sm mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Your Tasks
          </h3>
          <p className="text-xs text-gray-600 dark:text-zinc-400">
            Create, track and update your daily work items.
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-zinc-500">
          {tasks.length} task{tasks.length !== 1 && "s"}
        </span>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[1.2fr,2fr,0.8fr,0.6fr] gap-3 mb-4"
      >
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-zinc-400 mb-1">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Morning deep work"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-zinc-400 mb-1">
            Description
          </label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional note or details"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-zinc-400 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-10 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-500/90 disabled:opacity-60 transition"
          >
            {saving
              ? editingId
                ? "Saving..."
                : "Adding..."
              : editingId
              ? "Update"
              : "Add Task"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
        {loadingTasks ? (
          <div className="py-6 text-center text-xs text-gray-500 dark:text-zinc-500">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500 dark:text-zinc-500">
            No tasks yet. Start by adding your first one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-zinc-800">
            {tasks.map((task) => {
              const id = task.id || task._id;
              const isDone =
                task.status === "DONE" || task.completed || task.isDone;

              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-2.5 bg-white dark:bg-zinc-900"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {task.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      {task.description || "No description"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                        isDone
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/40"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/40"
                      }`}
                    >
                      {isDone ? "Done" : "Pending"}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="px-2 py-1 rounded-full border border-gray-300 dark:border-zinc-700 text-[11px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                    >
                      {isDone ? "Mark Pending" : "Mark Done"}
                    </button>

                    <button
                      onClick={() => handleEdit(task)}
                      className="px-2 py-1 rounded-full border border-indigo-500/60 text-[11px] text-indigo-500 hover:bg-indigo-500/10 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(task)}
                      className="px-2 py-1 rounded-full border border-red-500/60 text-[11px] text-red-500 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksSection;
