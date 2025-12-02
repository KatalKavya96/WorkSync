import React, { useState } from "react";

const initialGoals = [
  { id: 1, title: "Daily Deep Work", progress: 60 },
  { id: 2, title: "Exercise 4x/week", progress: 40 },
  { id: 3, title: "Inbox Zero", progress: 75 },
];

const Goals = () => {
  const [goals, _setGoals] = useState(initialGoals);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500/20 to-pink-500/20 border border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-slate-50">Goals</h2>
        <p className="text-xs text-slate-400">Define targets and visualize your progress.</p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
        {goals.map((g) => (
          <div key={g.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-50 font-medium">{g.title}</span>
              <span className="text-[11px] text-slate-400">{g.progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-emerald-500 to-indigo-500"
                style={{ width: `${g.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;