const express = require("express");
const router = express.Router();
const { listProjects, createProject, inviteMember } = require("./controllers");

router.get("/", listProjects);
router.post("/", createProject);
router.post("/:id/invite", inviteMember);

module.exports = router;
