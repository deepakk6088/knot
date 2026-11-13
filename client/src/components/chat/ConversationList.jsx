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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 p-6">
        <Loader2 className="animate-spin text-indigo-500" size={24} />
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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
          <MessageCircle size={24} />
        </div>
        <p className="text-sm font-semibold text-white">
          {searchQuery ? "No matching conversations" : "No conversations yet"}
        </p>
        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
          {searchQuery
            ? "Try searching for another contact name or username."
            : "Click the + icon above to start your first chat."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
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
