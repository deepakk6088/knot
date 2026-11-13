import React from "react";
import ConversationItem from "./ConversationItem";
import { MessageCircle, Loader2 } from "lucide-react";

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelectConversation,
  isLoading,
  searchQuery = ""
}) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2.5 p-6">
        <Loader2 className="animate-spin text-[#1e3a8a]" size={26} />
        <span className="text-xs font-semibold text-slate-600">Loading conversations...</span>
      </div>
    );
  }

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (c.otherUser?.displayName || "").toLowerCase();
    const username = (c.otherUser?.username || "").toLowerCase();
    return name.includes(query) || username.includes(query);
  });

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#edf2ea] border border-[#c8d8c3] flex items-center justify-center text-[#34452e] mb-2 shadow-xs">
          <MessageCircle size={22} />
        </div>
        <p className="text-sm font-bold text-slate-900">
          {searchQuery ? "No matching conversations" : "No conversations yet"}
        </p>
        <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
          {searchQuery
            ? "Try searching for another contact name or username."
            : "Click the + icon above to start your first chat."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[#ede8de]">
      {filtered.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onSelect={onSelectConversation}
          currentUserId={conv.currentUser?.id}
        />
      ))}
    </div>
  );
}
