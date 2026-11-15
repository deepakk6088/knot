import React, { useEffect, useState, useCallback, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { messageApi } from "../../services/api";
import socketService from "../../services/socket";
import { getInitials, getAvatarColor, formatConversationDate } from "../../utils/formatters";
import { MoreVertical, Phone, Video, AlertCircle } from "lucide-react";

export default function ChatWindow({ conversation, currentUserId, otherPresence }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });

  const activeConversationIdRef = useRef(conversation?.id);
  const isSendingRef = useRef(false);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const otherTypingTimeoutRef = useRef(null);

  const TYPING_IDLE_TIMEOUT_MS = 2500;
  const OTHER_TYPING_SAFETY_TIMEOUT_MS = 4000;

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

    // Join the current conversation room on mount and each time the conversation changes.
    // The backend room membership is per-socket-connection, so it must be re-established
    // whenever the socket reconnects. The "connect" listener below handles that case.
    socketService.emit("conversation:join", { conversationId: conversation.id });

    // Re-join the conversation room on every socket reconnection.
    // Socket.IO's auto-reconnect creates a new socket session on the server side, which
    // means all previously joined rooms are lost. Re-emitting "conversation:join" restores
    // room membership without duplicating it (the backend guards against double-joins).
    const handleReconnect = () => {
      socketService.emit("conversation:join", { conversationId: conversation.id });
    };

    socketService.on("connect", handleReconnect);

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
      socketService.off("connect", handleReconnect);
      socketService.off("message:receive", handleMessageReceive);
      socketService.emit("conversation:leave", { conversationId: conversation.id });
    };
  }, [conversation?.id]);

  // ── Receipt status update listeners ─────────────────────────────────────────
  // Apply SENT / DELIVERED / READ status updates to the message list in-place.
  // Status rank: SENT (0) → DELIVERED (1) → READ (2).
  // An incoming receipt is applied only when the new status is strictly higher
  // than the current status stored in state, preventing backward regressions.
  useEffect(() => {
    if (!conversation?.id) return;

    const STATUS_RANK = { SENT: 0, DELIVERED: 1, READ: 2 };

    // Helper: applies a new status to all matching message IDs in state.
    // Skips any message whose current status is already equal or ahead.
    const applyStatusUpdate = (messageIds, newStatus) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (!messageIds.includes(m.id)) return m;
          const currentRank = STATUS_RANK[m.status] ?? -1;
          const newRank = STATUS_RANK[newStatus] ?? -1;
          if (newRank <= currentRank) return m; // never regress
          return { ...m, status: newStatus };
        })
      );
    };

    // message:sent — server push to the sender's own socket.
    // Payload: { messageId, conversationId, status, senderId, tempId, ... }
    // This fires alongside the callback ack. It carries the authoritative DB
    // status (always "SENT") and can be used to reconcile any temp message
    // that slipped through without being replaced by the callback path.
    const handleMessageSent = (data) => {
      if (!data || !data.messageId || data.conversationId !== conversation.id) return;
      applyStatusUpdate([data.messageId], "SENT");
    };

    // message:delivered — server emits to the sender's personal room (all tabs)
    // when the recipient's socket receives/processes the message.
    // Payload: { conversationId, recipientId, messageIds: string[], status: "DELIVERED", deliveredAt }
    const handleMessageDelivered = (data) => {
      if (!data || data.conversationId !== conversation.id) return;
      applyStatusUpdate(data.messageIds, "DELIVERED");
    };

    // message:read — server emits to the sender's personal room when the
    // recipient marks the conversation as read.
    // Payload: { conversationId, readerId, messageIds: string[], status: "READ", readAt }
    const handleMessageRead = (data) => {
      if (!data || data.conversationId !== conversation.id) return;
      applyStatusUpdate(data.messageIds, "READ");
    };

    socketService.on("message:sent", handleMessageSent);
    socketService.on("message:delivered", handleMessageDelivered);
    socketService.on("message:read", handleMessageRead);

    return () => {
      socketService.off("message:sent", handleMessageSent);
      socketService.off("message:delivered", handleMessageDelivered);
      socketService.off("message:read", handleMessageRead);
    };
  }, [conversation?.id]);
  // ────────────────────────────────────────────────────────────────────────────

  // Clean up user's own typing emission when switching conversations or unmounting
  useEffect(() => {
    return () => {
      if (isTypingRef.current && activeConversationIdRef.current) {
        socketService.emit("typing:stop", { conversationId: activeConversationIdRef.current });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [conversation?.id]);

  // Handle incoming typing indicator events from the other participant
  useEffect(() => {
    if (!conversation?.id) return;

    // Reset typing indicator when switching conversations
    setIsOtherTyping(false);
    if (otherTypingTimeoutRef.current) {
      clearTimeout(otherTypingTimeoutRef.current);
      otherTypingTimeoutRef.current = null;
    }

    const handleRemoteTypingStart = (data) => {
      if (!data || data.conversationId !== conversation.id) return;

      // Do not display current user's own typing status
      if (data.userId && data.userId === currentUserId) return;

      setIsOtherTyping(true);

      // Safety timeout: auto-clear indicator if no stop event is received
      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
      }
      otherTypingTimeoutRef.current = setTimeout(() => {
        setIsOtherTyping(false);
      }, OTHER_TYPING_SAFETY_TIMEOUT_MS);
    };

    const handleRemoteTypingStop = (data) => {
      if (!data || data.conversationId !== conversation.id) return;

      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
        otherTypingTimeoutRef.current = null;
      }
      setIsOtherTyping(false);
    };

    socketService.on("typing:start", handleRemoteTypingStart);
    socketService.on("typing:stop", handleRemoteTypingStop);

    return () => {
      socketService.off("typing:start", handleRemoteTypingStart);
      socketService.off("typing:stop", handleRemoteTypingStop);

      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
        otherTypingTimeoutRef.current = null;
      }
      setIsOtherTyping(false);
    };
  }, [conversation?.id, currentUserId]);

  // Emit typing start with idle debounce
  const emitTypingStart = useCallback(() => {
    if (!conversation?.id || !socketService.isConnected()) return;

    // Prevent repeated unnecessary typing-start emissions
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketService.emit("typing:start", { conversationId: conversation.id });
    }

    // Reset idle timeout on each keystroke
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, TYPING_IDLE_TIMEOUT_MS);
  }, [conversation?.id]);

  // Emit typing stop immediately
  const emitTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current && conversation?.id && socketService.isConnected()) {
      isTypingRef.current = false;
      socketService.emit("typing:stop", { conversationId: conversation.id });
    } else {
      isTypingRef.current = false;
    }
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

    // Immediately stop typing indicator when sending a message
    emitTypingStop();

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

  const isOtherOnline = Boolean(otherPresence?.isOnline);

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
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#fbf9f5] transition-colors ${
                isOtherOnline ? "bg-[#4d7c0f]" : "bg-slate-300"
              }`}
              title={isOtherOnline ? "Online" : "Offline"}
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" title={otherUser?.username ? `@${otherUser.username}` : undefined}>
              {displayName}
            </h2>
            <div className="text-xs font-medium">
              {isOtherTyping ? (
                <span className="text-[#1e3a8a] font-semibold flex items-center gap-1 animate-pulse">
                  <span>typing</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-[#1e3a8a] rounded-full animate-bounce" />
                  </span>
                </span>
              ) : isOtherOnline ? (
                <span className="text-[#4d7c0f] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4d7c0f]" />
                  Online
                </span>
              ) : otherPresence?.lastSeenAt ? (
                <span className="text-slate-500">
                  Last seen {formatConversationDate(otherPresence.lastSeenAt)}
                </span>
              ) : (
                <span className="text-slate-400">Offline</span>
              )}
            </div>
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

      {/* Typing Indicator Bubble */}
      {isOtherTyping && (
        <div className="px-6 py-1.5 flex items-center gap-2 text-xs text-slate-500 select-none shrink-0">
          <div className="flex items-center gap-1.5 bg-[#fbf9f5] px-3.5 py-1.5 rounded-2xl border border-[#ded8cb] shadow-2xs">
            <span className="font-semibold text-slate-800">{displayName}</span>
            <span>is typing</span>
            <span className="inline-flex items-center gap-0.5 ml-0.5">
              <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full animate-bounce" />
            </span>
          </div>
        </div>
      )}

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={emitTypingStart}
        onTypingStop={emitTypingStop}
        disabled={isLoading || isSending}
      />
    </div>
  );
}
