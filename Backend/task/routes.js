// Backend/task/routes.js
const express = require("express");
const router = express.Router();
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("./controllers");

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
