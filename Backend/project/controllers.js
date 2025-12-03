const prisma = require("../prisma/prisma");

const listProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(projects);
  } catch (err) {
    console.error("Error listing projects:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await prisma.project.create({
      data: { name: name.trim(), ownerId: userId },
    });

    // Owner is ADMIN member implicitly; optionally create a member record
    await prisma.projectMember.create({
      data: { projectId: project.id, userId, role: "ADMIN" },
    }).catch(() => {});

    return res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const inviteMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const projectId = Number(req.params.id);
    if (!projectId || Number.isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project id" });
    }

    const { email, role = "MEMBER" } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Only owner or ADMIN can invite
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isAdmin = project.ownerId === userId || (membership && membership.role !== "MEMBER");
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    // If user exists, add as member; else create invitation record
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.projectMember.create({
        data: { projectId, userId: user.id, role },
      }).catch(async (e) => {
        // ignore unique constraint if already member, update role
        await prisma.projectMember.update({
          where: { projectId_userId: { projectId, userId: user.id } },
          data: { role },
        }).catch(() => {});
      });
      return res.status(200).json({ message: "Member added" });
    }

    await prisma.invitation.create({
      data: { projectId, email, role },
    });
    return res.status(201).json({ message: "Invitation created" });
  } catch (err) {
    console.error("Error inviting member:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  listProjects,
  createProject,
  inviteMember,
};
