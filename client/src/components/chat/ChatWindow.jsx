import React, { useEffect, useState, useCallback } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { messageApi } from "../../services/api";
import { getInitials } from "../../utils/formatters";
import { User, MoreVertical, Phone, Video } from "lucide-react";

export default function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });

  const otherUser = conversation?.otherUser;

  // Fetch initial message history
  const loadInitialMessages = useCallback(async (convId) => {
    if (!convId) return;
    setIsLoading(true);
    try {
      const res = await messageApi.getMessages(convId, { limit: 30 });
      if (res.success) {
        setMessages(res.data);
        setPagination({
          hasMore: res.pagination?.hasMore || false,
          nextCursor: res.pagination?.nextCursor || null
        });
        // Mark messages as read
        messageApi.markConversationRead(convId).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversation?.id) {
      loadInitialMessages(conversation.id);
    }
  }, [conversation?.id, loadInitialMessages]);

  // Load previous / older messages
  const handleLoadMore = async () => {
    if (!pagination.hasMore || isLoadingMore || !conversation?.id) return;
    setIsLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const res = await messageApi.getMessages(conversation.id, {
        limit: 30,
        before: oldestMessage ? oldestMessage.createdAt : null,
        cursor: pagination.nextCursor
      });

      if (res.success) {
        // Prepend older messages
        setMessages((prev) => [...res.data, ...prev]);
        setPagination({
          hasMore: res.pagination?.hasMore || false,
          nextCursor: res.pagination?.nextCursor || null
        });
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const handleSendMessage = async (content) => {
    if (!conversation?.id || !content.trim()) return;

    // Optimistic message update
    const tempId = "temp-" + Date.now();
    const optimisticMsg = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      content,
      status: "SENT",
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await messageApi.sendMessage(conversation.id, content);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove or mark failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Chat Window Header */}
      <div className="h-16 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            {otherUser?.avatarUrl ? (
              <img
                src={otherUser.avatarUrl}
                alt={otherUser.displayName || otherUser.username}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-semibold text-sm">
                {getInitials(otherUser?.displayName || otherUser?.username)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {otherUser?.displayName || otherUser?.username || "Unknown Contact"}
            </h2>
            <p className="text-xs text-slate-400">
              @{otherUser?.username || "user"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="Audio Call">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="Video Call">
            <Video size={18} />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="More Options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hasMore={pagination.hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
      />

      {/* Message Input Box */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
