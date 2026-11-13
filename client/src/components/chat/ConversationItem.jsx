import React from "react";
import { formatConversationDate, getInitials, getAvatarColor } from "../../utils/formatters";
import { Check, CheckCheck } from "lucide-react";

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUserId
}) {
  const { otherUser, lastMessage, updatedAt } = conversation;
  const isOwnLastMessage = lastMessage && lastMessage.senderId === currentUserId;

  const displayName = otherUser?.displayName || otherUser?.username || "Contact";
  const avatarStyle = getAvatarColor(displayName);

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-all border-b border-[#ede8de] select-none ${
        isSelected
          ? "bg-[#ede8de] border-l-[3.5px] border-l-[#1e3a8a]"
          : "hover:bg-[#f5f1e8]/80"
      }`}
    >
      {/* Contact Avatar with Rich Palette */}
      <div className="relative shrink-0">
        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt={displayName}
            className="w-11 h-11 rounded-2xl object-cover border border-[#ded8cb] shadow-xs"
          />
        ) : (
          <div className={`w-11 h-11 rounded-2xl ${avatarStyle.bg} ${avatarStyle.text} border ${avatarStyle.border} flex items-center justify-center font-bold text-sm shadow-xs`}>
            {getInitials(displayName)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm truncate ${isSelected ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
            {displayName}
          </h3>
          <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
            {formatConversationDate(lastMessage?.createdAt || updatedAt)}
          </span>
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
          {isOwnLastMessage && (
            <span className="inline-flex shrink-0">
              {lastMessage.status === "READ" ? (
                <CheckCheck size={14} className="text-[#1e3a8a] font-bold" />
              ) : lastMessage.status === "DELIVERED" ? (
                <CheckCheck size={14} className="text-slate-400" />
              ) : (
                <Check size={14} className="text-slate-400" />
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
