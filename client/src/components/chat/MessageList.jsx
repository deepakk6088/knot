import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { formatDateDivider } from "../../utils/formatters";
import { Loader2, ArrowUpCircle, MessageSquareOff } from "lucide-react";

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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <span className="text-sm">Loading chat history...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-2">
          <MessageSquareOff size={26} />
        </div>
        <p className="text-base font-medium text-slate-300">No messages yet</p>
        <p className="text-sm max-w-xs text-slate-400">
          Send a greeting below to start your conversation!
        </p>
      </div>
    );
  }

  // Group messages by date
  let lastDateStr = null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 flex flex-col space-y-1 select-none"
    >
      {/* Load Previous Messages Button / Indicator */}
      {hasMore && (
        <div className="flex justify-center my-3">
          <button
            onClick={handleLoadMoreClick}
            disabled={isLoadingMore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin text-emerald-400" />
                <span>Loading older messages...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle size={14} className="text-emerald-400" />
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
              <div className="flex items-center justify-center my-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800/90 text-slate-400 border border-slate-700/50 uppercase tracking-wider">
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
