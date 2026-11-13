import React from "react";
import { MessageSquare, ShieldCheck, Zap, Database } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center select-none border-l border-slate-800/40">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl">
          <MessageSquare size={38} className="stroke-[1.7]" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
          <Zap size={14} className="fill-slate-950" />
        </span>
      </div>

      <h1 className="text-2xl font-bold text-slate-100 mb-2">
        KNOT Desktop Messenger
      </h1>

      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        Select a conversation from the sidebar or click the plus button to start messaging contacts securely.
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
          <Database size={14} className="text-emerald-400" />
          <span>PostgreSQL Persistent</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
          <ShieldCheck size={14} className="text-sky-400" />
          <span>Participant Validated</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
          <Zap size={14} className="text-amber-400" />
          <span>Zero-Duplicate Architecture</span>
        </div>
      </div>
    </div>
  );
}
