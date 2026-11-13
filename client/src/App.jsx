import React, { useState, useEffect, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/chat/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
import EmptyChatState from "./components/chat/EmptyChatState";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
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

function ChatLayout({ currentUser, onSwitchUser, onLogout, isDevMode }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    loadConversations();
  }, [loadConversations, currentUser?.id]);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased select-none">
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={setSelectedConversation}
        isLoading={isLoading}
        currentUser={currentUser}
        onRefresh={loadConversations}
        onConversationCreated={handleConversationCreated}
        onSwitchUser={onSwitchUser}
        onLogout={onLogout}
        isDevMode={isDevMode}
      />

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

export default function App() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [devMode, setDevMode] = useState(() => localStorage.getItem("knot_dev_mode") === "true");

  const [currentUser, setCurrentUser] = useState(() => {
    if (user?.id) return user;
    const savedId = localStorage.getItem("knot_user_id");
    return DEMO_USERS.find((u) => u.id === savedId) || DEMO_USERS[0];
  });

  useEffect(() => {
    if (user?.id) {
      setCurrentUser(user);
      localStorage.setItem("knot_user_id", user.id);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser?.id && !isAuthenticated) {
      localStorage.setItem("knot_user_id", currentUser.id);
    }
  }, [currentUser, isAuthenticated]);

  const handleSwitchUser = () => {
    if (isAuthenticated) {
      logout();
      return;
    }
    const currentIndex = DEMO_USERS.findIndex((u) => u.id === currentUser?.id);
    const nextUser = DEMO_USERS[(currentIndex + 1) % DEMO_USERS.length];
    setCurrentUser(nextUser);
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setDevMode(false);
      localStorage.removeItem("knot_dev_mode");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading KNOT...</p>
        </div>
      </div>
    );
  }

  const isAccessAllowed = isAuthenticated || devMode;

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAccessAllowed ? (
              <Navigate to="/" replace />
            ) : (
              <div className="relative">
                <Login />
                <div className="fixed bottom-4 right-4 z-50">
                  <button
                    onClick={() => {
                      setDevMode(true);
                      localStorage.setItem("knot_dev_mode", "true");
                    }}
                    className="px-4 py-2.5 text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-800 border border-indigo-200/90 rounded-2xl shadow-lg shadow-indigo-100/50 transition-all cursor-pointer backdrop-blur flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>Test Chat UI (Live Preview)</span>
                  </button>
                </div>
              </div>
            )
          }
        />
        <Route
          path="/signup"
          element={isAccessAllowed ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/"
          element={
            isAccessAllowed ? (
              <ChatLayout
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                onLogout={handleLogout}
                isDevMode={devMode && !isAuthenticated}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
