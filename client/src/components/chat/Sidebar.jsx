
import React, { useState } from "react";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import {
  Search,
  Plus,
  MessageCircle,
  X,
  RefreshCw,
  LogOut,
  Settings,
  UserRound
} from "lucide-react";
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
  onOpenProfile,
  onOpenSettings,
  isDevMode
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userIdentity = (
    <>
      <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-[#fbf9f5] flex items-center justify-center font-bold text-xs shadow-md shadow-[#1e3a8a]/20 overflow-hidden shrink-0">
        {currentUser?.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          getInitials(
            currentUser?.displayName || currentUser?.username || "You"
          )
        )}
      </div>

      <div className="min-w-0 text-left">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
          <span className="truncate">
            {currentUser?.displayName || currentUser?.username || "KNOT User"}
          </span>

          {isDevMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#edf2ea] text-[#34452e] border border-[#c8d8c3] font-bold shrink-0">
              OLIVE
            </span>
          )}
        </h1>

        <p
          className="text-[11px] text-slate-400 font-mono truncate"
          title={currentUser?.id}
        >
          ID: {currentUser?.id ? currentUser.id.slice(0, 8) + "..." : "Guest"}
        </p>
      </div>
    </>
  );

  return (
    <div className="w-80 md:w-96 h-full bg-[#fbf9f5] border-r border-[#e5dfd5] flex flex-col shrink-0 shadow-xs">

      {/* Top Header: Current User Identity & Actions */}
      <div className="h-16 px-4 bg-[#fbf9f5] border-b border-[#e5dfd5] flex items-center justify-between shrink-0">
        {onOpenProfile ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-3 min-w-0 rounded-xl p-1 -ml-1 hover:bg-[#f1eee7] transition-colors cursor-pointer"
            title="View and edit profile"
            aria-label="View and edit profile"
          >
            {userIdentity}
          </button>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            {userIdentity}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {onSwitchUser && isDevMode && (
            <button
              onClick={onSwitchUser}
              className="p-2 text-slate-500 hover:text-[#1e3a8a] hover:bg-[#ede8de] rounded-xl transition-colors cursor-pointer"
              title="Switch Demo User"
            >
              <RefreshCw size={17} />
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-[#ede8de] rounded-xl transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <MessageCircle size={17} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-[#fbf9f5] rounded-xl transition-all shadow-md shadow-[#1e3a8a]/20 cursor-pointer ml-1"
            title="Start New Chat"
          >
            <Plus size={17} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-700 hover:bg-[#f6e8ee] rounded-xl transition-colors cursor-pointer ml-0.5"
              title={isDevMode ? "Exit Preview Mode" : "Sign Out"}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#e5dfd5] bg-[#f5f1e8]/70">
        <div className="relative flex items-center">
          <Search
            size={15}
            className="absolute left-3.5 text-slate-400 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fdfcf9] border border-[#e2ddd3] rounded-2xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#bfd0f0] transition-all shadow-2xs"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
              aria-label="Clear search"
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

      {/* Sidebar Navigation */}
      <div className="p-3 border-t border-[#e5dfd5] space-y-1">
        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-[#f1eee7] transition-colors cursor-pointer"
          >
            <UserRound size={17} />
            Profile
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-[#f1eee7] transition-colors cursor-pointer"
          >
            <Settings size={17} />
            Settings
          </button>
        )}
      </div>

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
