import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Copy, Check, Code, Zap, Menu, 
  ThumbsUp, ThumbsDown, RotateCcw, Paperclip, ArrowUp, Moon, Sun 
} from 'lucide-react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  { icon: Code, title: 'Code Refactoring', desc: 'Optimize code, fix bugs & write tests' },
  { icon: Sparkles, title: 'Write & Edit', desc: 'Draft emails, articles or documentation' },
  { icon: Zap, title: 'Brainstorm Ideas', desc: 'Generate creative concepts & solutions' },
  { icon: Bot, title: 'Explain Concepts', desc: 'Break down complex topics simply' }
];

export default function ChatInterface({ 
  activeChat, 
  token, 
  user, 
  onToggleSidebar, 
  onNewChat,
  theme = 'dark',
  onToggleTheme 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Socket setup
  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:3000', {
      query: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('response', (aiResponse) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          role: 'assistant',
          content: aiResponse,
          createdAt: new Date().toISOString()
        }
      ]);
    });

    socket.on('connect_error', () => {
      setIsTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Load chat messages when activeChat changes
  useEffect(() => {
    if (!activeChat || !token) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    api.getMessages(activeChat._id, token)
      .then((data) => {
        setMessages(data || []);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
      })
      .finally(() => {
        setLoadingMessages(false);
      });
  }, [activeChat?._id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || !activeChat?._id || isTyping) return;

    const userMessageObj = {
      _id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInput('');
    setIsTyping(true);

    if (socketRef.current) {
      socketRef.current.emit('message', {
        chatId: activeChat._id,
        data: text.trim()
      });
    }
  };

  const handleRegenerate = () => {
    if (isTyping || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Code formatting helper
  const renderMessageContent = (content) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || 'code', value: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#060608]">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <span className="uppercase font-medium">{part.language}</span>
              <button
                onClick={() => handleCopy(part.value, `code-${idx}`)}
                className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                {copiedIndex === `code-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedIndex === `code-${idx}` ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono text-zinc-200 overflow-x-auto m-0 bg-transparent">
              <code>{part.value}</code>
            </pre>
          </div>
        );
      }
      return <span key={idx}>{part.value}</span>;
    });
  };

  const userFirstName = user?.name?.firstName || 'User';

  return (
    <div className={`flex-1 h-full flex flex-col relative transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#09090B] text-zinc-100' : 'bg-[#FAFAFA] text-zinc-900'
    }`}>
      {/* Clean Header */}
      <header className={`h-13 px-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-10 select-none transition-colors ${
        theme === 'dark' ? 'bg-[#09090B]/90 border-zinc-800/80' : 'bg-white/90 border-zinc-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="text-zinc-400 hover:text-zinc-100 cursor-pointer transition-colors"
          >
            <Menu size={19} />
          </button>

          <h2 className="text-xs font-semibold tracking-tight">
            {activeChat ? activeChat.title : 'Zoro AI'}
          </h2>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Main Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
        {!activeChat ? (
          /* Empty state - No active chat */
          <div className="my-auto text-center max-w-sm p-6 select-none">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4 mx-auto text-zinc-100">
              <Bot size={24} />
            </div>
            <h2 className="text-base font-semibold mb-1.5 text-zinc-100">
              Select or start a chat
            </h2>
            <button
              onClick={onNewChat}
              className="mt-3 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-900 font-semibold text-xs cursor-pointer hover:bg-white transition-colors"
            >
              + Start new chat
            </button>
          </div>
        ) : loadingMessages ? (
          /* Skeleton Loader */
          <div className="w-full max-w-2xl space-y-5 my-auto p-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 skeleton-shimmer rounded" />
                <div className="h-14 w-3/4 skeleton-shimmer rounded-xl" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Clean Welcome View */
          <div className="my-auto text-center max-w-xl w-full p-4 md:p-6 select-none">
            <h1 className="text-xl font-semibold text-zinc-100 mb-6">
              How can I help you today, {userFirstName}?
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {QUICK_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(`Help me with ${prompt.title.toLowerCase()}: ${prompt.desc}`)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-[#121215] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent size={15} className="text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-200">{prompt.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{prompt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="w-full max-w-2xl space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 border ${
                    isUser 
                      ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
                      : 'bg-zinc-100 text-zinc-900 border-white'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble Container */}
                  <div className="max-w-[85%] space-y-1">
                    <div className={`flex items-center gap-2 text-[11px] font-medium text-zinc-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'You' : 'Zoro AI'}</span>
                      {msg.createdAt && (
                        <span className="text-[10px] font-normal text-zinc-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-zinc-800 text-zinc-100 rounded-tr-xs border border-zinc-700/80 shadow-xs'
                        : theme === 'dark'
                          ? 'bg-[#121215] text-zinc-200 border border-zinc-800 rounded-tl-xs shadow-xs'
                          : 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-xs'
                    }`}>
                      {renderMessageContent(msg.content)}

                      {/* Action Bar for AI */}
                      {!isUser && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                          <button
                            onClick={() => handleCopy(msg.content, index)}
                            className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {index === messages.length - 1 && (
                            <button
                              onClick={handleRegenerate}
                              className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing animation */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-900 border border-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 ${
                  theme === 'dark' ? 'bg-[#121215] border border-zinc-800' : 'bg-white border border-zinc-200'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dot-anim-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dot-anim-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dot-anim-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Clean Input Bar */}
      {activeChat && (
        <div className={`p-4 border-t backdrop-blur-md sticky bottom-0 z-10 transition-colors ${
          theme === 'dark' ? 'bg-[#09090B]/90 border-zinc-800/80' : 'bg-white/90 border-zinc-200'
        }`}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="w-full max-w-2xl mx-auto relative"
          >
            <div className={`relative flex items-end rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-[#121215] border-zinc-800 focus-within:border-zinc-600'
                : 'bg-white border-zinc-300 focus-within:border-zinc-500 shadow-xs'
            }`}>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Zoro AI..."
                className="w-full pl-4 pr-20 py-3 text-xs bg-transparent outline-none resize-none max-h-32 leading-relaxed text-zinc-100 placeholder:text-zinc-500"
              />

              <div className="absolute right-2.5 bottom-2 flex items-center gap-1">
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() && !isTyping
                      ? 'bg-zinc-100 text-zinc-900 cursor-pointer shadow-xs hover:bg-white'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={15} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
