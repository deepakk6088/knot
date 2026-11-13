import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { formatDateDivider } from "../../utils/formatters";
import { Loader2, ArrowUpCircle, MessageSquare } from "lucide-react";

export default function MessageList({
  messages = [],
  currentUserId,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  isLoading = false
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevHeightRef = useRef(0);

  // Auto-scroll to bottom on first load or when sending new message
  useEffect(() => {
    if (!isLoadingMore && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoadingMore]);

  // Preserve scroll position when loading previous messages
  useEffect(() => {
    if (isLoadingMore && containerRef.current) {
      const newHeight = containerRef.current.scrollHeight;
      const heightDiff = newHeight - prevHeightRef.current;
      containerRef.current.scrollTop += heightDiff;
    }
  }, [messages]);

  const handleLoadMoreClick = () => {
    if (containerRef.current) {
      prevHeightRef.current = containerRef.current.scrollHeight;
    }
    onLoadMore();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={30} />
        <span className="text-xs font-medium">Loading chat history...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-xs">
          <MessageSquare size={24} />
        </div>
        <p className="text-sm font-bold text-slate-800">No messages yet</p>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Send a message below to start your conversation.
        </p>
      </div>
    );
  }

  let lastDateStr = null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-1 select-none"
    >
      {/* Load Previous Messages Button */}
      {hasMore && (
        <div className="flex justify-center my-3">
          <button
            onClick={handleLoadMoreClick}
            disabled={isLoadingMore}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-600" />
                <span>Loading older messages...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle size={14} className="text-indigo-600" />
                <span>Load previous messages</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Render Chronological Messages with Date Dividers */}
      {messages.map((message) => {
        const messageDate = new Date(message.createdAt).toDateString();
        const showDivider = messageDate !== lastDateStr;
        lastDateStr = messageDate;

        const isOwn = message.senderId === currentUserId;

        return (
          <React.Fragment key={message.id}>
            {showDivider && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-500 border border-slate-200/80 uppercase tracking-wider shadow-xs">
                  {formatDateDivider(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble message={message} isOwnMessage={isOwn} />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
