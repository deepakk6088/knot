import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach auth token or dev user ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("knot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Dev user ID fallback (allows switching users for testing Member 2 features)
  const currentUserId = localStorage.getItem("knot_user_id");
  if (currentUserId && !config.headers.Authorization) {
    config.headers["x-user-id"] = currentUserId;
  }

  return config;
});

// Conversation APIs
export const conversationApi = {
  getConversations: async () => {
    const res = await api.get("/conversations");
    return res.data;
  },

  getConversationById: async (conversationId) => {
    const res = await api.get(`/conversations/${conversationId}`);
    return res.data;
  },

  createConversation: async (targetUserId) => {
    const res = await api.post("/conversations", { targetUserId });
    return res.data;
  }
};

// Message APIs
export const messageApi = {
  getMessages: async (conversationId, { limit = 30, cursor = null, before = null } = {}) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    if (before) params.before = before;

    const res = await api.get(`/messages/conversation/${conversationId}`, { params });
    return res.data;
  },

  sendMessage: async (conversationId, content) => {
    const res = await api.post("/messages", { conversationId, content });
    return res.data;
  },

  updateMessageStatus: async (messageId, status) => {
    const res = await api.patch(`/messages/${messageId}/status`, { status });
    return res.data;
  },

  markConversationRead: async (conversationId) => {
    const res = await api.post(`/messages/conversation/${conversationId}/read`);
    return res.data;
  }
};

export default api;
