import React, { useState } from "react";
import { X, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { conversationApi } from "../../services/api";

export default function NewChatModal({ isOpen, onClose, onConversationCreated }) {
  const [targetUserId, setTargetUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = targetUserId.trim();
    if (!trimmedId) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await conversationApi.createConversation(trimmedId);
      if (res.success && res.data) {
        onConversationCreated(res.data);
        onClose();
      } else {
        setError(res.error || "Failed to create conversation");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to initiate conversation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#101117] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Start New Conversation</h3>
              <p className="text-[11px] text-gray-400">Connect with a user on KNOT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Contact User ID (UUID)
            </label>
            <input
              type="text"
              placeholder="e.g. a0000000-0000-0000-0000-000000000001"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-[#181a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              autoFocus
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Enter the unique ID of the person you'd like to chat with.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !targetUserId.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Start Chat</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
