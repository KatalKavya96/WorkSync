import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-slate-50">Calendar</h2>
        <p className="text-xs text-slate-400">Plan your week and track schedule at a glance.</p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d} className="text-[11px] text-slate-400 text-center uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:shadow-sm transition relative"
            >
              <span className="absolute top-2 left-2 text-[10px] text-slate-500">{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

