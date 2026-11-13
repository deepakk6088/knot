
import React, { useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
  AlertCircle,
  Search,
  User,
  CheckCircle2
} from "lucide-react";

import {
  conversationApi,
  userApi
} from "../../services/api";

import {
  getInitials,
  getAvatarColor
} from "../../utils/formatters";

export default function NewChatModal({
  isOpen,
  onClose,
  onConversationCreated
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a username or display name to search.");
      return;
    }

    setIsSearching(true);
    setError("");
    setUsers([]);
    setSelectedUser(null);
    setHasSearched(false);

    try {
      const res = await userApi.searchUsers(trimmedQuery);

      if (res.success) {
        setUsers(res.users || []);
        setHasSearched(true);
      } else {
        setError(res.message || "Unable to search users.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
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
        setError(res.message || "Failed to create conversation.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to start conversation. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setUsers([]);
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
              Search Users
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter username or name..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedUser(null);
                    setUsers([]);
                    setHasSearched(false);
                    setError("");
                  }}
                  className="w-full bg-white border border-[#ded8cb] rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="flex items-center justify-center w-12 h-12 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search users"
              >
                {isSearching ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Search size={17} />
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Search by username or display name.
            </p>
          </form>

          {/* Search Results */}
          {(users.length > 0 || hasSearched) && (
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Search Results
              </p>

              {users.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {users.map((user) => {
                    const displayName =
                      user.displayName || user.username;

                    const avatarStyle = getAvatarColor(
                      displayName
                    );

                    const isSelected =
                      selectedUser?.id === user.id;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setError("");
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#e8edf7] border-[#1e3a8a]"
                            : "bg-white border-[#e5dfd5] hover:bg-[#f5f1e8]"
                        }`}
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-xl object-cover border border-[#ded8cb]"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-xl ${avatarStyle.bg} ${avatarStyle.text} ${avatarStyle.border} border flex items-center justify-center text-xs font-bold`}
                          >
                            {getInitials(displayName)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {displayName}
                          </p>

                          <p className="text-xs text-slate-500 truncate">
                            @{user.username}
                          </p>
                        </div>

                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            className="text-[#1e3a8a] shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-white border border-dashed border-[#ded8cb] rounded-2xl">
                  <User
                    size={22}
                    className="mx-auto text-slate-300 mb-2"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    No users found
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Try another username or display name.
                  </p>
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
