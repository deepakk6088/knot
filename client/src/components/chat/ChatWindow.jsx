import React, { useEffect, useState, useCallback } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { messageApi } from "../../services/api";
import { getInitials, getAvatarColor } from "../../utils/formatters";
import { MoreVertical, Phone, Video } from "lucide-react";

export default function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });

  const otherUser = conversation?.otherUser;
  const displayName = otherUser?.displayName || otherUser?.username || "Contact";
  const avatarStyle = getAvatarColor(displayName);

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
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f3ee] relative overflow-hidden">
      {/* Chat Window Header */}
      <div className="h-16 px-6 bg-[#fbf9f5] border-b border-[#e5dfd5] flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {otherUser?.avatarUrl ? (
              <img
                src={otherUser.avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-2xl object-cover border border-[#ded8cb] shadow-xs"
              />
            ) : (
              <div className={`w-10 h-10 rounded-2xl ${avatarStyle.bg} ${avatarStyle.text} border ${avatarStyle.border} flex items-center justify-center font-bold text-sm shadow-xs`}>
                {getInitials(displayName)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4d7c0f] border-2 border-[#fbf9f5]" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              @{otherUser?.username || "user"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button className="p-2 hover:bg-[#ede8de] hover:text-[#1e3a8a] rounded-xl transition-colors cursor-pointer" title="Audio Call">
            <Phone size={17} />
          </button>
          <button className="p-2 hover:bg-[#ede8de] hover:text-[#1e3a8a] rounded-xl transition-colors cursor-pointer" title="Video Call">
            <Video size={17} />
          </button>
          <button className="p-2 hover:bg-[#ede8de] hover:text-slate-800 rounded-xl transition-colors cursor-pointer" title="More Options">
            <MoreVertical size={17} />
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
