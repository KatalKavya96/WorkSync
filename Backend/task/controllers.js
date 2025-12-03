
const prisma = require("../prisma/prisma");

const listTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    // Query params: page, pageSize, sortBy, sortOrder, status, dateFrom, dateTo, q
    const {
      page = "1",
      pageSize = "10",
      sortBy = "date",
      sortOrder = "desc",
      status,
      dateFrom,
      dateTo,
      q,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * take;

    // Build where clause
    const where = { userId };
    if (status === "PENDING" || status === "DONE") {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        const df = new Date(dateFrom);
        if (!isNaN(df)) where.date.gte = df;
      }
      if (dateTo) {
        const dt = new Date(dateTo);
        if (!isNaN(dt)) where.date.lte = dt;
      }
    }
    if (q && typeof q === "string" && q.trim().length > 0) {
      const query = q.trim();
      where.OR = [
        { title: { contains: query } },
        { notes: { contains: query } },
      ];
    }

    // Sorting
    const allowedSort = new Set(["date", "createdAt", "updatedAt", "status", "title"]);
    const orderField = allowedSort.has(String(sortBy)) ? String(sortBy) : "date";
    const orderDir = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const total = await prisma.task.count({ where });
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ [orderField]: orderDir }],
      skip,
      take,
    });

    return res.status(200).json({
      data: tasks,
      meta: {
        total,
        page: pageNum,
        pageSize: take,
        totalPages: Math.ceil(total / take) || 1,
        sortBy: orderField,
        sortOrder: orderDir,
      },
    });
  } catch (err) {
    console.error("Error listing tasks:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { title, notes, date, status } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    let taskDate;
    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "Invalid date" });
      }
      taskDate = parsed;
    } else {
      taskDate = new Date();
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        notes: notes?.trim() || null,
        status: status === "DONE" ? "DONE" : "PENDING",
        date: taskDate,
        userId,
      },
    });

    return res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const updateTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { title, notes, status, date } = req.body;
    const data = {};

    if (title !== undefined) {
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Invalid title" });
      }
      data.title = title.trim();
    }

    if (notes !== undefined) {
      data.notes =
        typeof notes === "string" && notes.trim().length > 0
          ? notes.trim()
          : null;
    }

    if (status !== undefined) {
      if (status !== "PENDING" && status !== "DONE") {
        return res.status(400).json({ error: "Invalid status" });
      }
      data.status = status;
    }

    if (date !== undefined) {
      const parsed = new Date(date);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "Invalid date" });
      }
      data.date = parsed;
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating task:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting task:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
