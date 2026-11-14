import React, { useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
  AlertCircle,
  Search,
  Check,
  UserRound
} from "lucide-react";
import { conversationApi, userApi } from "../../services/api";
import { getAvatarColor, getInitials } from "../../utils/formatters";

export default function NewChatModal({
  isOpen,
  onClose,
  onConversationCreated
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setIsSearching(true);
    setError("");
    setSelectedUser(null);
    setHasSearched(true);

    try {
      const response = await userApi.searchUsers(trimmedQuery);
      setSearchResults(response || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to search users. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUser) return;

    setIsCreating(true);
    setError("");

    try {
      const res = await conversationApi.createConversation(
        selectedUser.id
      );

      if (res.success && res.data) {
        onConversationCreated(res.data);
        handleClose();
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
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setError("");
    setHasSearched(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
      <div className="bg-[#fbf9f5] border border-[#ded8cb] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5dfd5] bg-[#f5f1e8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8edf7] text-[#1e3a8a] border border-[#bfd0f0] flex items-center justify-center shadow-xs">
              <UserPlus size={18} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Start New Conversation
              </h3>

              <p className="text-[11px] text-slate-500 font-medium">
                Find someone on KNOT
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-xl hover:bg-[#ede8de]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 space-y-4">

          <form onSubmit={handleSearch}>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Find by Name or Username
            </label>

            <div className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
              />

              <input
                type="text"
                placeholder="Type a username or display name..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                autoFocus
                className="w-full bg-[#ffffff] border border-[#ded8cb] rounded-2xl pl-10 pr-20 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] transition-all"
              />

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 px-3 py-1.5 text-xs font-semibold bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Results ({searchResults.length})
              </p>

              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No users found matching "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#ede8de]">
                  {searchResults.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    const name =
                      user.displayName || user.username;
                    const avatarStyle = getAvatarColor(name);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#ede8de] ring-2 ring-[#1e3a8a]"
                            : "hover:bg-[#f5f1e8]"
                        }`}
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={name}
                            className="w-10 h-10 rounded-2xl object-cover border border-[#ded8cb]"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-2xl ${avatarStyle.bg} ${avatarStyle.text} border ${avatarStyle.border} flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {getInitials(name)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user.displayName || user.username}
                          </p>

                          <p className="text-xs text-slate-400 truncate">
                            @{user.username}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#ede8de] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateConversation}
              disabled={!selectedUser || isCreating}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-[#1e3a8a] hover:bg-[#1e40af] text-[#fbf9f5] rounded-xl shadow-md shadow-[#1e3a8a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Start Chat</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
