import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { formatMessageTime } from "../../utils/formatters";

export default function MessageBubble({ message, isOwnMessage }) {
  const { content, createdAt, status } = message;

  return (
    <div
      className={`flex w-full mb-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] sm:max-w-[65%] md:max-w-[60%] px-3.5 py-2 rounded-2xl shadow-sm text-sm relative break-words ${
          isOwnMessage
            ? "bg-emerald-600 text-white rounded-br-xs"
            : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60"
        }`}
      >
        {/* Message Content */}
        <p className="whitespace-pre-wrap leading-relaxed select-text">{content}</p>

        {/* Timestamp & Status Metadata */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${
            isOwnMessage ? "text-emerald-100/80" : "text-slate-400"
          }`}
        >
          <span>{formatMessageTime(createdAt)}</span>

          {isOwnMessage && (
            <span className="inline-flex items-center ml-0.5">
              {status === "READ" ? (
                <CheckCheck size={14} className="text-sky-300 stroke-[2.5]" title="Read" />
              ) : status === "DELIVERED" ? (
                <CheckCheck size={14} className="text-emerald-200 stroke-[2.2]" title="Delivered" />
              ) : (
                <Check size={14} className="text-emerald-200/70 stroke-[2]" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
