
const prisma = require("../prisma/prisma");

const isMember = async (userId, projectId) => {
  if (!projectId) return true;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return false;
  if (project.ownerId === userId) return true;
  const membership = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  return !!membership;
};

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
      priority,
      projectId: projectIdParam,
      dateFrom,
      dateTo,
      q,
      tags,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * take;

    // Build where clause
    const where = { userId };
    if (status === "PENDING" || status === "DONE") {
      where.status = status;
    }
    if (priority === "LOW" || priority === "NORMAL" || priority === "HIGH") {
      where.priority = priority;
    }
    const projectId = projectIdParam ? Number(projectIdParam) : undefined;
    if (projectId) {
      const memberOk = await isMember(userId, projectId).catch(() => false);
      if (!memberOk) return res.status(403).json({ error: "Forbidden" });
      where.projectId = projectId;
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
    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tagList.length > 0) {
        where.tags = {
          some: {
            tag: { name: { in: tagList } },
          },
        };
      }
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

    const { title, notes, date, status, priority, projectId, tags } = req.body;

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

    // project membership check
    let projId = null;
    if (projectId !== undefined && projectId !== null) {
      const pid = Number(projectId);
      if (!Number.isNaN(pid)) {
        const memberOk = await isMember(userId, pid).catch(() => false);
        if (!memberOk) return res.status(403).json({ error: "Forbidden" });
        projId = pid;
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        notes: notes?.trim() || null,
        status: status === "DONE" ? "DONE" : "PENDING",
        priority: ["LOW", "NORMAL", "HIGH"].includes(priority) ? priority : "NORMAL",
        date: taskDate,
        userId,
        projectId: projId,
      },
    });

    // tags linkage
    if (Array.isArray(tags) && tags.length > 0) {
      const names = tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0);
      for (const name of names) {
        const tagRec = await prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await prisma.taskTag.create({ data: { taskId: newTask.id, tagId: tagRec.id } });
      }
    }

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

    const { title, notes, status, date, priority, tags } = req.body;
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

    if (priority !== undefined) {
      if (!["LOW", "NORMAL", "HIGH"].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }
      data.priority = priority;
    }

    if (date !== undefined) {
      const parsed = new Date(date);
      if (isNaN(parsed)) {
        return res.status(400).json({ error: "Invalid date" });
      }
      data.date = parsed;
    }

    const updated = await prisma.task.update({ where: { id }, data });

    // Update tags if provided
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "Invalid tags" });
      }
      const names = tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0);
      // Remove existing links
      await prisma.taskTag.deleteMany({ where: { taskId: id } });
      for (const name of names) {
        const tagRec = await prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await prisma.taskTag.create({ data: { taskId: id, tagId: tagRec.id } });
      }
    }

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

const listSubtasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const taskId = Number(req.params.id);
    if (!taskId || Number.isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const parent = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!parent) return res.status(404).json({ error: "Task not found" });
    const subs = await prisma.subtask.findMany({ where: { parentId: taskId }, orderBy: { createdAt: "asc" } });
    return res.status(200).json(subs);
  } catch (err) {
    console.error("Error listing subtasks:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createSubtask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const taskId = Number(req.params.id);
    if (!taskId || Number.isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const parent = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!parent) return res.status(404).json({ error: "Task not found" });
    const { title, status } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }
    const sub = await prisma.subtask.create({
      data: { parentId: taskId, title: title.trim(), status: status === "DONE" ? "DONE" : "PENDING" },
    });
    return res.status(201).json(sub);
  } catch (err) {
    console.error("Error creating subtask:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateSubtask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const subId = Number(req.params.subId);
    if (!subId || Number.isNaN(subId)) {
      return res.status(400).json({ error: "Invalid subtask id" });
    }
    const existing = await prisma.subtask.findUnique({ where: { id: subId } });
    if (!existing) return res.status(404).json({ error: "Subtask not found" });
    const parent = await prisma.task.findFirst({ where: { id: existing.parentId, userId } });
    if (!parent) return res.status(404).json({ error: "Parent task not found" });
    const { title, status } = req.body;
    const data = {};
    if (title !== undefined) {
      if (!title || typeof title !== "string") return res.status(400).json({ error: "Invalid title" });
      data.title = title.trim();
    }
    if (status !== undefined) {
      if (status !== "PENDING" && status !== "DONE") return res.status(400).json({ error: "Invalid status" });
      data.status = status;
    }
    const updated = await prisma.subtask.update({ where: { id: subId }, data });
    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating subtask:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteSubtask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const subId = Number(req.params.subId);
    if (!subId || Number.isNaN(subId)) {
      return res.status(400).json({ error: "Invalid subtask id" });
    }
    const existing = await prisma.subtask.findUnique({ where: { id: subId } });
    if (!existing) return res.status(404).json({ error: "Subtask not found" });
    const parent = await prisma.task.findFirst({ where: { id: existing.parentId, userId } });
    if (!parent) return res.status(404).json({ error: "Parent task not found" });
    await prisma.subtask.delete({ where: { id: subId } });
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting subtask:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
};
