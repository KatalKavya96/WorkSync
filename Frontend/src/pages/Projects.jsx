import React, { useEffect, useState } from "react";
import { listProjects, createProject, inviteMember } from "../api/projects";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [invite, setInvite] = useState({ projectId: "", email: "", role: "MEMBER" });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await listProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createProject({ name: name.trim() });
      setName("");
      fetchProjects();
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    const pid = Number(invite.projectId);
    if (!pid || !invite.email.trim()) return;
    try {
      await inviteMember(pid, { email: invite.email.trim(), role: invite.role });
      setInvite({ projectId: "", email: "", role: "MEMBER" });
      fetchProjects();
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-slate-50">Projects</h2>
        <p className="text-xs text-slate-400">Create projects and invite members with roles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-50 mb-3">Create a project</h3>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/70"
              placeholder="Project name"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition">
              Create
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-50 mb-3">Invite a member</h3>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={invite.projectId}
              onChange={(e) => setInvite((prev) => ({ ...prev, projectId: e.target.value }))}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            >
              <option value="">Choose project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              value={invite.email}
              onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
              placeholder="Member email"
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value }))}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" className="px-3 py-2 rounded-xl bg-indigo-500 text-slate-950 text-xs font-semibold hover:bg-indigo-400 transition">
              Invite
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Your projects</h3>
        {loading ? (
          <div className="text-xs text-slate-500 py-6 text-center">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">No projects yet.</div>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                <div className="text-sm text-slate-50">{p.name}</div>
                <div className="text-[11px] text-slate-500">Owner ID: {p.ownerId}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
