const express = require("express");
const router = express.Router();
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} = require("./controllers");

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

// Subtasks
router.get("/:id/subtasks", listSubtasks);
router.post("/:id/subtasks", createSubtask);
router.patch("/subtasks/:subId", updateSubtask);
router.delete("/subtasks/:subId", deleteSubtask);

module.exports = router;
