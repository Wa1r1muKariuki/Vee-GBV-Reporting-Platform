"use client";

import { MessageSquare, Plus, Trash2, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface ChatSession {
  id: number;
  title: string;
  preview: string;
  timestamp: Date;
  saved: boolean;
  active: boolean;
  messages: any[];
}

interface ChatSidebarProps {
  chats: ChatSession[];
  onNewChat: () => void;
  onSaveChat: (id: number) => void;
  onDeleteChat: (id: number) => void;
  onSetActiveChat: (id: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ChatSidebar({ 
  chats, 
  onNewChat, 
  onSaveChat, 
  onDeleteChat, 
  onSetActiveChat,
  collapsed,
  onToggleCollapse 
}: ChatSidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className={`h-full flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 relative">
        {!collapsed ? (
          <div>
            <h1 className="text-lg font-bold text-white">Chat History</h1>
            <p className="text-xs text-gray-300 mt-0.5">Saved chats preserved</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-1 shadow-2xl hover:shadow-xl transition-all hover:scale-110 hidden lg:block"
        >
          {collapsed ? 
            <ChevronRight size={12} className="text-white" /> : 
            <ChevronLeft size={12} className="text-white" />
          }
        </button>
      </div>
      
      {/* New Chat Button */}
      <div className="p-3 border-b border-white/10">
        <button 
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-green-500 text-white py-2.5 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-teal-500/25 text-sm ${
            collapsed ? 'px-2' : 'px-3'
          }`}
        >
          <Plus size={16} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Chats List */}
        {!collapsed && chats.length > 0 && (
          <div className="p-3">
            <ul className="space-y-1.5">
              {chats.map((chat) => (
                <ChatSessionItem 
                  key={chat.id}
                  chat={chat}
                  onActivate={onSetActiveChat}
                  onSave={onSaveChat}
                  onDelete={onDeleteChat}
                  formatTime={formatTime}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Collapsed View */}
        {collapsed && (
          <div className="p-2 space-y-2">
            {chats.slice(0, 10).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSetActiveChat(chat.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative ${
                  chat.active 
                    ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg" 
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title={chat.title}
              >
                <MessageSquare size={16} />
                {chat.saved && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <BookmarkCheck size={10} className="text-teal-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!collapsed && chats.length === 0 && (
          <div className="text-center py-8 px-4 text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-xs font-medium text-gray-300 mb-1">No conversations</p>
            <p className="text-xs">Start a new chat</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        {!collapsed ? (
          <div className="text-xs text-gray-400 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Encrypted & Anonymous
            </div>
            <p className="text-xs">Privacy protected</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
}

function ChatSessionItem({ 
  chat, 
  onActivate, 
  onSave, 
  onDelete,
  formatTime,
  collapsed 
}: { 
  chat: any;
  onActivate: (id: number) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  formatTime: (date: Date) => string;
  collapsed: boolean;
}) {
  if (collapsed) return null;

  return (
    <li>
      <button
        onClick={() => onActivate(chat.id)}
        className={`w-full text-left p-3 rounded-xl transition-all group border ${
          chat.active 
            ? "bg-gradient-to-r from-teal-500/20 to-green-500/20 border-teal-500/30 shadow-lg" 
            : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare size={14} className={`flex-shrink-0 ${
                chat.active ? "text-teal-400" : "text-gray-400"
              }`} />
              <span className={`text-sm font-medium truncate ${
                chat.active ? "text-white" : "text-gray-300"
              }`}>
                {chat.title}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mb-1.5 leading-relaxed">
              {chat.preview}
            </p>
            <div className="text-xs text-gray-500">
              {formatTime(chat.timestamp)}
            </div>
          </div>
          
          <div className="flex gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSave(chat.id);
              }}
              className={`p-1 rounded-lg transition ${
                chat.saved 
                  ? "text-teal-400 hover:text-teal-300 bg-teal-400/10" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/10"
              }`}
              title={chat.saved ? "Unsave chat" : "Save chat"}
            >
              {chat.saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition rounded-lg"
              title="Delete chat"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </button>
    </li>
  );
}