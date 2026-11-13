import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/chat/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
import EmptyChatState from "./components/chat/EmptyChatState";
import Login from "./components/auth/Login";
import { useAuth } from "./context/AuthContext";
import { conversationApi } from "./services/api";

// Fallback demo user profiles for development and pair-testing
const DEMO_USERS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    username: "alice",
    displayName: "Alice Adams"
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    username: "bob",
    displayName: "Bob Baker"
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    username: "charlie",
    displayName: "Charlie Clark"
  }
];

export default function App() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [devMode, setDevMode] = useState(() => localStorage.getItem("knot_dev_mode") === "true");

  // Current active user
  const [currentUser, setCurrentUser] = useState(() => {
    if (user?.id) return user;
    const savedId = localStorage.getItem("knot_user_id");
    return DEMO_USERS.find((u) => u.id === savedId) || DEMO_USERS[0];
  });

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync authenticated user from AuthContext
  useEffect(() => {
    if (user?.id) {
      setCurrentUser(user);
      localStorage.setItem("knot_user_id", user.id);
    }
  }, [user]);

  // Sync dev user ID to localStorage for mock header auth
  useEffect(() => {
    if (currentUser?.id && !isAuthenticated) {
      localStorage.setItem("knot_user_id", currentUser.id);
    }
  }, [currentUser, isAuthenticated]);

  // Fetch conversations for the active user
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await conversationApi.getConversations();
      if (res.success) {
        setConversations(res.data);
        setSelectedConversation((prev) => {
          if (!prev) return null;
          return res.data.find((c) => c.id === prev.id) || prev;
        });
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated || devMode) {
      loadConversations();
    }
  }, [loadConversations, isAuthenticated, devMode, currentUser?.id]);

  // Conversation selection handler
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  // New conversation created handler
  const handleConversationCreated = (newConv) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === newConv.id);
      if (exists) {
        return prev.map((c) => (c.id === newConv.id ? newConv : c));
      }
      return [newConv, ...prev];
    });
    setSelectedConversation(newConv);
  };

  // Switch demo user in dev mode
  const handleSwitchUser = () => {
    if (isAuthenticated) {
      logout();
      return;
    }
    const currentIndex = DEMO_USERS.findIndex((u) => u.id === currentUser?.id);
    const nextUser = DEMO_USERS[(currentIndex + 1) % DEMO_USERS.length];
    setCurrentUser(nextUser);
    setSelectedConversation(null);
  };

  // Handle logout
  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setDevMode(false);
      localStorage.removeItem("knot_dev_mode");
    }
  };

  // Loading state while restoring session
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading KNOT...</p>
        </div>
      </div>
    );
  }

  // Render Login screen if not authenticated and dev mode not active
  if (!isAuthenticated && !devMode) {
    return (
      <div className="relative">
        <Login />
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              setDevMode(true);
              localStorage.setItem("knot_dev_mode", "true");
            }}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl shadow-xl transition-all cursor-pointer backdrop-blur"
          >
            ⚡ Test Chat UI (Dev Mode)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased select-none">
      {/* Conversation Sidebar */}
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoading}
        currentUser={currentUser}
        onRefresh={loadConversations}
        onConversationCreated={handleConversationCreated}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        isDevMode={devMode && !isAuthenticated}
      />

      {/* Main Chat Area */}
      {selectedConversation ? (
        <ChatWindow
          key={selectedConversation.id}
          conversation={selectedConversation}
          currentUserId={currentUser?.id}
        />
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
}
