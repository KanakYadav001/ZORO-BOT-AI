const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const api = {
  async register(data) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    return json;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    return json;
  },

  async logout(token) {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const json = await res.json();
    return json;
  },

  async getProfile(token) {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch profile');
    return json.user;
  },

  async getChats(token) {
    const res = await fetch(`${API_BASE_URL}/chat/get`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Failed to fetch chats');
    return json;
  },

  async createChat(title, token) {
    const res = await fetch(`${API_BASE_URL}/chat/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Failed to create chat');
    return json.chat;
  },

  async deleteChat(chatId, token) {
    const res = await fetch(`${API_BASE_URL}/chat/delete/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Failed to delete chat');
    return json;
  },

  async getMessages(chatId, token) {
    const res = await fetch(`${API_BASE_URL}/chat/messages/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Failed to fetch messages');
    return json;
  }
};
