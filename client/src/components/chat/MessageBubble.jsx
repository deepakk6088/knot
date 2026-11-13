import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { formatMessageTime } from "../../utils/formatters";

export default function MessageBubble({ message, isOwnMessage }) {
  const { content, createdAt, status } = message;

  return (
    <div
      className={`flex w-full mb-2.5 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] sm:max-w-[65%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm relative break-words ${
          isOwnMessage
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-md shadow-indigo-500/20"
            : "bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-xs"
        }`}
      >
        {/* Message Content */}
        <p className="whitespace-pre-wrap leading-relaxed select-text">{content}</p>

        {/* Timestamp & Status Metadata */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[11px] font-medium ${
            isOwnMessage ? "text-indigo-100/90" : "text-slate-400"
          }`}
        >
          <span>{formatMessageTime(createdAt)}</span>

          {isOwnMessage && (
            <span className="inline-flex items-center ml-0.5">
              {status === "READ" ? (
                <CheckCheck size={14} className="text-white stroke-[2.5]" title="Read" />
              ) : status === "DELIVERED" ? (
                <CheckCheck size={14} className="text-indigo-200 stroke-[2]" title="Delivered" />
              ) : (
                <Check size={14} className="text-indigo-200/80 stroke-[1.8]" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
