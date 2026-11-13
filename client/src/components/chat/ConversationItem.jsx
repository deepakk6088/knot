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
      className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all border-b border-white/[0.05] select-none ${
        isSelected
          ? "bg-[#181a24] border-l-[3px] border-l-indigo-500"
          : "hover:bg-white/[0.03]"
      }`}
    >
      {/* Contact Avatar */}
      <div className="relative shrink-0">
        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.displayName || otherUser.username}
            className="w-11 h-11 rounded-2xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
            {getInitials(otherUser?.displayName || otherUser?.username)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-white truncate">
            {otherUser?.displayName || otherUser?.username || "Contact"}
          </h3>
          <span className="text-[11px] text-gray-400 shrink-0 ml-2">
            {formatConversationDate(lastMessage?.createdAt || updatedAt)}
          </span>
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
          {isOwnLastMessage && (
            <span className="inline-flex shrink-0">
              {lastMessage.status === "READ" ? (
                <CheckCheck size={14} className="text-indigo-400" />
              ) : lastMessage.status === "DELIVERED" ? (
                <CheckCheck size={14} className="text-gray-400" />
              ) : (
                <Check size={14} className="text-gray-400" />
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
