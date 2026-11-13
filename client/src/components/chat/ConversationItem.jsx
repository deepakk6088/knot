import React from "react";
import { formatConversationDate, getInitials } from "../../utils/formatters";
import { Check, CheckCheck } from "lucide-react";

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUserId
}) {
  const { otherUser, lastMessage, updatedAt } = conversation;

  const isOwnLastMessage = lastMessage && lastMessage.senderId === currentUserId;

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors border-b border-slate-800/40 select-none ${
        isSelected
          ? "bg-slate-800/90 border-l-4 border-l-emerald-500"
          : "hover:bg-slate-800/50"
      }`}
    >
      {/* Contact Avatar */}
      <div className="relative shrink-0">
        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.displayName || otherUser.username}
            className="w-11 h-11 rounded-full object-cover border border-slate-700/80"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {getInitials(otherUser?.displayName || otherUser?.username)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-100 truncate">
            {otherUser?.displayName || otherUser?.username || "Contact"}
          </h3>
          <span className="text-[11px] text-slate-400 shrink-0 ml-2">
            {formatConversationDate(lastMessage?.createdAt || updatedAt)}
          </span>
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
          {isOwnLastMessage && (
            <span className="inline-flex shrink-0">
              {lastMessage.status === "READ" ? (
                <CheckCheck size={13} className="text-sky-400" />
              ) : lastMessage.status === "DELIVERED" ? (
                <CheckCheck size={13} className="text-slate-400" />
              ) : (
                <Check size={13} className="text-slate-400" />
              )}
            </span>
          )}
          <span className="truncate">
            {lastMessage
              ? (isOwnLastMessage ? "You: " : "") + lastMessage.content
              : "No messages yet"}
          </span>
        </div>
      </div>
    </div>
  );
}
