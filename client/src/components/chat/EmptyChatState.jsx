import React from "react";
import { MessageCircle, LockKeyhole, Sparkles, Zap } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/80 p-8 text-center select-none">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
          <MessageCircle size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
        Conversations that connect.
      </h1>

      <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
        Select a conversation from the sidebar or click the plus button to message your contacts.
      </p>

      {/* Rich Color Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
          <LockKeyhole size={13} className="text-indigo-600" />
          <span>Private 1-on-1 Chats</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-xs">
          <Sparkles size={13} className="text-emerald-600" />
          <span>Instant Messaging</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold shadow-xs">
          <Zap size={13} className="text-amber-600" />
          <span>Real-time Sync</span>
        </div>
      </div>
    </div>
  );
}
