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
    <div className="w-80 md:w-96 h-full bg-white border-r border-slate-200/80 flex flex-col shrink-0 shadow-xs">
      {/* Top Header: Current User Identity & Actions */}
      <div className="h-16 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/20">
            {getInitials(currentUser?.displayName || currentUser?.username || "You")}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <span>{currentUser?.displayName || currentUser?.username || "KNOT User"}</span>
              {isDevMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold">
                  PREVIEW
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 font-mono truncate" title={currentUser?.id}>
              ID: {currentUser?.id ? currentUser.id.slice(0, 8) + "..." : "Guest"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onSwitchUser && isDevMode && (
            <button
              onClick={onSwitchUser}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-colors cursor-pointer"
              title="Switch Demo User"
            >
              <RefreshCw size={17} />
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <MessageCircle size={17} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all shadow-md shadow-indigo-500/25 cursor-pointer ml-1"
            title="Start New Chat"
          >
            <Plus size={17} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ml-0.5"
              title={isDevMode ? "Exit Preview Mode" : "Sign Out"}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-200/80 bg-slate-50/60">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
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
