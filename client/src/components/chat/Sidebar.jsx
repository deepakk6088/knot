import React, { useState } from "react";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import { Search, Plus, MessageCircle, X, RefreshCw, LogOut } from "lucide-react";
import { getInitials } from "../../utils/formatters";

export default function Sidebar({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  isLoading,
  currentUser,
  onRefresh,
  onConversationCreated,
  onSwitchUser,
  onLogout,
  isDevMode
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-80 md:w-96 h-full bg-[#101117] border-r border-white/10 flex flex-col shrink-0">
      {/* Top Header: Current User Identity & Actions */}
      <div className="h-16 px-4 bg-[#101117] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
            {getInitials(currentUser?.displayName || currentUser?.username || "You")}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
              <span>{currentUser?.displayName || currentUser?.username || "KNOT User"}</span>
              {isDevMode && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  DEV
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-400 font-mono truncate" title={currentUser?.id}>
              ID: {currentUser?.id ? currentUser.id.slice(0, 8) + "..." : "Guest"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onSwitchUser && isDevMode && (
            <button
              onClick={onSwitchUser}
              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              title="Switch Demo User"
            >
              <RefreshCw size={17} />
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <MessageCircle size={17} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer ml-1"
            title="Start New Chat"
          >
            <Plus size={17} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer ml-0.5"
              title={isDevMode ? "Exit Dev Mode" : "Sign Out"}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-white/10 bg-[#101117]">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181a24] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelectConversation={onSelectConversation}
        isLoading={isLoading}
        searchQuery={searchQuery}
      />

      {/* Modal to start a new chat */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={(newConv) => {
          onConversationCreated(newConv);
          onSelectConversation(newConv);
        }}
      />
    </div>
  );
}
