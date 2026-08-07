import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, LogOut, X, MessageSquare, Moon, Sun } from 'lucide-react';

export default function UserProfilePage({ 
  user, 
  chatCount = 0, 
  onClose, 
  onLogout,
  theme = 'dark',
  onToggleTheme 
}) {
  if (!user) return null;

  const firstName = user.name?.firstName || 'User';
  const lastName = user.name?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recent';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-[380px] rounded-2xl p-5 relative z-10 border shadow-2xl transition-colors ${
            theme === 'dark'
              ? 'bg-[#121215] border-zinc-800 text-zinc-100'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Profile Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">{fullName}</h2>
              <p className="text-zinc-400 text-xs">{user.email}</p>
            </div>
          </div>

          {/* Quick Details */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs mb-5 ${
            theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between py-1 border-b border-inherit">
              <div className="flex items-center gap-2 text-zinc-400">
                <MessageSquare size={14} />
                <span>Conversations</span>
              </div>
              <span className="font-semibold text-zinc-200">{chatCount}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-inherit">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={14} />
                <span>Member since</span>
              </div>
              <span className="font-medium text-zinc-200">{memberSince}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-zinc-400">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span>Theme</span>
              </div>
              <button
                onClick={onToggleTheme}
                className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onLogout}
              className="py-1.5 px-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={onClose}
              className="py-1.5 px-3.5 rounded-lg bg-zinc-100 text-zinc-900 font-medium text-xs cursor-pointer hover:bg-white transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
