import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MessageSquare, Trash2, Search, X, 
  Settings, Sun, Moon, Sparkles 
} from 'lucide-react';

export default function Sidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  user,
  onOpenProfile,
  onLogout,
  isOpen,
  onCloseMobile,
  theme = 'dark',
  onToggleTheme,
  loadingChats = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const firstName = user?.name?.firstName || 'User';
  const lastName = user?.name?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`w-64 h-full flex flex-col fixed lg:relative z-50 transition-colors duration-200 border-r select-none ${
        theme === 'dark' 
          ? 'bg-[#0C0C0E] border-zinc-800/80 text-zinc-300' 
          : 'bg-[#F4F4F5] border-zinc-200 text-zinc-700'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header & Brand */}
        <div className="p-3.5 border-b border-inherit space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
              }`}>
                <Sparkles size={13} />
              </div>
              <span className="font-semibold text-sm tracking-tight font-sans">
                Zoro AI
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTheme}
                title="Toggle Theme"
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-400 lg:hidden cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer border shadow-xs ${
              theme === 'dark'
                ? 'bg-zinc-100 text-zinc-900 border-white hover:bg-white'
                : 'bg-zinc-900 text-white border-zinc-800 hover:bg-black'
            }`}
          >
            <Plus size={15} />
            <span>New chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-xs outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 focus:border-zinc-700 placeholder:text-zinc-500'
                  : 'bg-white border border-zinc-200 text-zinc-800 focus:border-zinc-400 placeholder:text-zinc-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 ${
                  theme === 'dark' ? 'hover:text-zinc-300' : 'hover:text-zinc-800'
                }`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingChats ? (
            <div className="space-y-1.5 p-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-lg skeleton-shimmer bg-zinc-800/20" />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No conversations
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat._id === activeChatId;
              return (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-all group ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-zinc-800 text-white font-medium shadow-xs border border-zinc-700/60'
                        : 'bg-white text-zinc-900 font-medium shadow-xs border border-zinc-200'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                        : 'text-zinc-600 hover:bg-white hover:text-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <MessageSquare 
                      size={14} 
                      className={`shrink-0 ${
                        isActive 
                          ? 'text-indigo-400' 
                          : 'text-zinc-500 group-hover:text-zinc-400'
                      }`} 
                    />
                    <span className="truncate">{chat.title || 'Untitled'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat._id);
                    }}
                    title="Delete"
                    className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 p-0.5 transition-opacity cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User Footer */}
        <div className={`p-2.5 border-t ${theme === 'dark' ? 'border-zinc-800/80 bg-[#09090B]' : 'border-zinc-200 bg-zinc-200/40'}`}>
          <div className={`flex items-center justify-between p-2 rounded-xl border ${
            theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div 
              onClick={onOpenProfile}
              className="flex items-center gap-2 cursor-pointer min-w-0 flex-1 hover:opacity-90 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-xs font-medium truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {fullName}
                </span>
                <span className="block text-[10px] text-zinc-500 truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={onOpenProfile}
              title="Profile"
              className={`p-1 transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
