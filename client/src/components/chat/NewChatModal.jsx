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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shadow-xs">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Start New Conversation</h3>
              <p className="text-[11px] text-slate-500 font-medium">Connect with a user on KNOT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-xl hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Contact User ID (UUID)
            </label>
            <input
              type="text"
              placeholder="e.g. a0000000-0000-0000-0000-000000000001"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Enter the unique ID of the person you'd like to chat with.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !targetUserId.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
