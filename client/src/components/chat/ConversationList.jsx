import React from "react";
import ConversationItem from "./ConversationItem";
import { MessageSquareDashed, Loader2 } from "lucide-react";

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelectConversation,
  isLoading,
  searchQuery = ""
}) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
        <span className="text-xs">Loading conversations...</span>
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
        <MessageSquareDashed size={32} className="text-slate-600 mb-1" />
        <p className="text-sm font-medium text-slate-300">
          {searchQuery ? "No matching conversations" : "No conversations yet"}
        </p>
        <p className="text-xs text-slate-400 max-w-[200px]">
          {searchQuery
            ? "Try searching for another contact name or username."
            : "Click the + icon above to start your first chat."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
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
