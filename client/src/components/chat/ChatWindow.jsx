import React, { useEffect, useState, useCallback, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { messageApi } from "../../services/api";
import socketService from "../../services/socket";
import { getInitials, getAvatarColor } from "../../utils/formatters";
import { MoreVertical, Phone, Video, AlertCircle } from "lucide-react";

export default function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });

  const activeConversationIdRef = useRef(conversation?.id);
  const isSendingRef = useRef(false);

  useEffect(() => {
    activeConversationIdRef.current = conversation?.id;
    setSendError(null);
  }, [conversation?.id]);

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

  // Subscribe to real-time incoming messages for the active conversation
  useEffect(() => {
    if (!conversation?.id) return;

    // Join the current conversation room
    socketService.emit("conversation:join", { conversationId: conversation.id });

    const handleMessageReceive = (incomingMsg) => {
      if (!incomingMsg || !incomingMsg.id) return;

      // Ensure the message belongs strictly to this active conversation
      if (incomingMsg.conversationId !== conversation.id) {
        return;
      }

      setMessages((prevMessages) => {
        // Prevent duplicate messages
        const alreadyExists = prevMessages.some(
          (m) =>
            m.id === incomingMsg.id ||
            (m.id.startsWith("temp-") &&
              m.content === incomingMsg.content &&
              m.senderId === incomingMsg.senderId)
        );

        if (alreadyExists) {
          // If the message replaces an optimistic temporary message, swap it cleanly
          return prevMessages.map((m) =>
            m.id === incomingMsg.id ||
            (m.id.startsWith("temp-") &&
              m.content === incomingMsg.content &&
              m.senderId === incomingMsg.senderId)
              ? incomingMsg
              : m
          );
        }

        // Append the new incoming message
        return [...prevMessages, incomingMsg];
      });
    };

    socketService.on("message:receive", handleMessageReceive);

    return () => {
      socketService.off("message:receive", handleMessageReceive);
      socketService.emit("conversation:leave", { conversationId: conversation.id });
    };
  }, [conversation?.id]);

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

  // Send message via real-time Socket.IO connection
  const handleSendMessage = async (content) => {
    const targetConversationId = conversation?.id;
    const trimmedContent = content?.trim();

    if (!targetConversationId || !trimmedContent || isSendingRef.current) {
      return { success: false };
    }

    // 8. Prevent accidental duplicate sends while send is in progress
    isSendingRef.current = true;
    setIsSending(true);
    setSendError(null);

    const clientTempId = "temp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
    const optimisticMsg = {
      id: clientTempId,
      conversationId: targetConversationId,
      senderId: currentUserId,
      content: trimmedContent,
      status: "SENT",
      createdAt: new Date().toISOString()
    };

    // Optimistically display the outgoing message
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let persistedMessage = null;

      // 4. Use existing authenticated socket connection
      if (socketService.isConnected()) {
        const ack = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Message send timed out"));
          }, 10000);

          socketService.emit(
            "message:send",
            {
              conversationId: targetConversationId,
              content: trimmedContent,
              tempId: clientTempId
            },
            (response) => {
              clearTimeout(timeout);
              if (response && response.success) {
                resolve(response);
              } else {
                reject(new Error(response?.error || "Failed to send message"));
              }
            }
          );
        });

        persistedMessage = ack.data;
      } else {
        // Fallback to REST API if socket connection is temporarily unavailable
        const res = await messageApi.sendMessage(targetConversationId, trimmedContent);
        if (res && res.success && res.data) {
          persistedMessage = res.data;
        } else {
          throw new Error(res?.error || "Failed to send message");
        }
      }

      // 5. Update the chat UI with the persisted message returned by the server acknowledgement
      if (persistedMessage) {
        // 11. Ensure switching conversations does not cause message to be displayed in wrong conversation
        if (targetConversationId === activeConversationIdRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === clientTempId || m.id === persistedMessage.id
                ? persistedMessage
                : m
            )
          );
        }
        return { success: true, data: persistedMessage };
      }

      return { success: false, error: "No message data returned" };
    } catch (err) {
      console.error("[ChatWindow] Failed to send message:", err.message);
      setSendError(err.message || "Failed to send message");

      // 7. Handle server errors gracefully: remove optimistic message and signal failure
      setMessages((prev) => prev.filter((m) => m.id !== clientTempId));
      return { success: false, error: err.message };
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
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

      {/* Sending Error Banner */}
      {sendError && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2 p-1 cursor-pointer"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isSending}
      />
    </div>
  );
}
