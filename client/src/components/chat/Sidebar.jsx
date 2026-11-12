import React, { useState } from "react";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import { Search, Plus, MessageSquare, X, RefreshCw } from "lucide-react";
import { getInitials } from "../../utils/formatters";

export default function Sidebar({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  isLoading,
  currentUser,
  onRefresh,
  onConversationCreated,
  onSwitchUser
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-80 md:w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Top Header: Current User Identity & Actions */}
      <div className="h-16 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            {getInitials(currentUser?.displayName || currentUser?.username || "You")}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 truncate">
              <span>{currentUser?.displayName || currentUser?.username || "KNOT User"}</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono truncate" title={currentUser?.id}>
              ID: {currentUser?.id ? currentUser.id.slice(0, 8) + "..." : "Guest"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onSwitchUser && (
            <button
              onClick={onSwitchUser}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Switch Test User"
            >
              <RefreshCw size={17} />
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <MessageSquare size={17} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm cursor-pointer ml-1"
            title="Start New Chat"
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search or start new chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
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
