import React from "react";
import { MessageCircle, LockKeyhole, Sparkles, Shield } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f5f3ee] p-8 text-center select-none">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-3xl bg-[#1e3a8a] flex items-center justify-center text-[#fbf9f5] shadow-xl shadow-[#1e3a8a]/20">
          <MessageCircle size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
        Conversations that connect.
      </h1>

      <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
        Select a conversation from the sidebar or click the plus button to message your contacts.
      </p>

      {/* Elegant Royal & Olive Heritage Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e8edf7] border border-[#bfd0f0] text-[#1e3a8a] text-xs font-semibold shadow-2xs">
          <LockKeyhole size={13} className="text-[#1e3a8a]" />
          <span>Private 1-on-1 Chats</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#edf2ea] border border-[#c8d8c3] text-[#34452e] text-xs font-semibold shadow-2xs">
          <Shield size={13} className="text-[#34452e]" />
          <span>End-to-End Delivery</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f1e4] border border-[#dfd5b9] text-[#6b551e] text-xs font-semibold shadow-2xs">
          <Sparkles size={13} className="text-[#6b551e]" />
          <span>Real-time Messaging</span>
        </div>
      </div>
    </div>
  );
}
