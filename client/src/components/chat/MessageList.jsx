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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={30} />
        <span className="text-xs font-medium">Loading chat history...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
          <MessageSquare size={24} />
        </div>
        <p className="text-sm font-semibold text-white">No messages yet</p>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#181a24] hover:bg-[#202230] border border-white/10 text-gray-300 hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-400" />
                <span>Loading older messages...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle size={14} className="text-indigo-400" />
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
                <span className="px-3.5 py-1 rounded-full text-[11px] font-medium bg-[#181a24] text-gray-400 border border-white/10 uppercase tracking-wider shadow-sm">
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
