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
            ? "bg-[#1e40af] text-[#fbf9f5] rounded-br-xs shadow-md shadow-[#1e40af]/20"
            : "bg-[#ffffff] text-slate-800 rounded-bl-xs border border-[#ded8cb] shadow-2xs"
        }`}
      >
        {/* Message Content */}
        <p className="whitespace-pre-wrap leading-relaxed select-text">{content}</p>

        {/* Timestamp & Status Metadata */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[11px] font-medium ${
            isOwnMessage ? "text-[#c7d7f7]" : "text-slate-400"
          }`}
        >
          <span>{formatMessageTime(createdAt)}</span>

          {isOwnMessage && (
            <span className="inline-flex items-center ml-0.5">
              {status === "READ" ? (
                <CheckCheck size={14} className="text-[#fbf9f5] stroke-[2.5]" title="Read" />
              ) : status === "DELIVERED" ? (
                <CheckCheck size={14} className="text-[#bfd0f0] stroke-[2]" title="Delivered" />
              ) : (
                <Check size={14} className="text-[#bfd0f0]/80 stroke-[1.8]" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
