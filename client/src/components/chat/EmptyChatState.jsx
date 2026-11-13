import React from "react";
import { MessageCircle, LockKeyhole, Sparkles } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#08090d] p-8 text-center select-none">
      <div className="relative mb-6">
        {/* KNOT Brand Icon matching Login.jsx */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/25">
          <MessageCircle size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">
        Conversations that connect.
      </h1>

      <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
        Select a conversation from the sidebar or click the plus button to message your contacts.
      </p>

      {/* Subtle KNOT Brand Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101117] border border-white/10 text-gray-300 text-xs">
          <LockKeyhole size={13} className="text-indigo-400" />
          <span>Private 1-on-1 Chats</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101117] border border-white/10 text-gray-300 text-xs">
          <Sparkles size={13} className="text-indigo-400" />
          <span>Real-time Messaging</span>
        </div>
      </div>
    </div>
  );
}
