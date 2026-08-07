import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import UserProfilePage from './components/UserProfilePage';
import { api } from './services/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('zoro_token') || null);
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('zoro_theme') || 'dark');

  // Sync theme class on <html> root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('zoro_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize Auth & Profile
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingApp(false);
      return;
    }

    api.getProfile(token)
      .then((userData) => {
        setUser(userData);
      })
      .catch((err) => {
        console.error('Session expired or invalid token:', err);
        handleLogout();
      })
      .finally(() => {
        setLoadingApp(false);
      });
  }, [token]);

  // Load Chats when user is logged in
  useEffect(() => {
    if (!token || !user) return;

    setLoadingChats(true);
    api.getChats(token)
      .then((chatList) => {
        setChats(chatList || []);
        if (chatList && chatList.length > 0 && !activeChatId) {
          setActiveChatId(chatList[0]._id);
        }
      })
      .catch((err) => {
        console.error('Error fetching chats:', err);
      })
      .finally(() => {
        setLoadingChats(false);
      });
  }, [token, user]);

  const handleAuthSuccess = (newToken, userData) => {
    setToken(newToken);
    if (userData) setUser(userData);
  };

  const handleLogout = () => {
    if (token) {
      api.logout(token).catch(() => {});
    }
    localStorage.removeItem('zoro_token');
    setToken(null);
    setUser(null);
    setChats([]);
    setActiveChatId(null);
    setIsProfileOpen(false);
  };

  const handleNewChat = async () => {
    if (!token) return;
    try {
      const defaultTitle = `Chat ${chats.length + 1}`;
      const newChat = await api.createChat(defaultTitle, token);
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!token) return;
    try {
      await api.deleteChat(chatId, token);
      setChats((prev) => {
        const updated = prev.filter((c) => c._id !== chatId);
        if (activeChatId === chatId) {
          setActiveChatId(updated.length > 0 ? updated[0]._id : null);
        }
        return updated;
      });
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  if (loadingApp) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center font-bold text-lg ${
        theme === 'dark' ? 'bg-[#0F172A] text-indigo-400' : 'bg-slate-50 text-indigo-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping" />
          <span>Loading Zoro AI...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const activeChat = chats.find((c) => c._id === activeChatId) || null;

  return (
    <div className={`flex w-screen h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        loadingChats={loadingChats}
      />

      {/* Main Chat Interface */}
      <ChatInterface
        activeChat={activeChat}
        token={token}
        user={user}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* User Profile Page Modal */}
      {isProfileOpen && (
        <UserProfilePage
          user={user}
          chatCount={chats.length}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
