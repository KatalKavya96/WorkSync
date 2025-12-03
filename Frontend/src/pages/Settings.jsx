import React from "react";

const Settings = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 to-lime-500/20 border border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
        <p className="text-xs text-slate-400">Manage your profile and app preferences.</p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-sm font-semibold text-slate-50">Profile</div>
            <div className="text-[11px] text-slate-400 mb-3">Update your display name and email</div>
            <div className="space-y-2">
              <input className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none" placeholder="Display Name" />
              <input className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none" placeholder="Email" />
              <button className="px-3 py-2 rounded-xl bg-indigo-500 text-slate-950 text-xs font-semibold hover:bg-indigo-400 transition">Save</button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-sm font-semibold text-slate-50">Appearance</div>
            <div className="text-[11px] text-slate-400 mb-3">Toggle theme and density</div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span className="text-slate-300">Enable compact mode</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span className="text-slate-300">Reduce motion</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

