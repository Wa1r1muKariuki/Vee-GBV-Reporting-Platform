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
  language: "en" | "sw";
}

export default function ChatSidebar({ 
  chats, 
  onNewChat, 
  onSaveChat, 
  onDeleteChat, 
  onSetActiveChat,
  collapsed,
  onToggleCollapse,
  language
}: ChatSidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return language === 'sw' ? 'Leo' : 'Today';
    if (diffInDays === 1) return language === 'sw' ? 'Jana' : 'Yesterday';
    if (diffInDays < 7) return language === 'sw' ? `${diffInDays} siku zilizopita` : `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getText = (english: string, swahili: string) => {
    return language === 'sw' ? swahili : english;
  };

  return (
    <aside className={`h-full flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-purple-100 relative bg-gradient-to-r from-purple-50 to-pink-50">
        {!collapsed ? (
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {getText('Chat History', 'Historia ya Mazungumzo')}
            </h1>
            <p className="text-xs text-purple-600/70 mt-1">
              {getText('Saved chats preserved', 'Mazungumzo yaliyohifadhiwa')}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <MessageSquare size={20} className="text-purple-600" />
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-purple-200 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-110 hidden lg:block"
        >
          {collapsed ? 
            <ChevronRight size={14} className="text-purple-600" /> : 
            <ChevronLeft size={14} className="text-purple-600" />
          }
        </button>
      </div>
      
      {/* New Chat Button */}
      <div className="p-3 border-b border-purple-100">
        <button 
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 rounded-xl font-semibold hover:scale-105 transition-all shadow-md hover:shadow-lg text-sm ${
            collapsed ? 'px-2' : 'px-3'
          }`}
        >
          <Plus size={16} />
          {!collapsed && getText('New Chat', 'Mazungumzo Mapya')}
        </button>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-transparent">
        {/* Chats List */}
        {!collapsed && chats.length > 0 && (
          <div className="p-3">
            <ul className="space-y-2">
              {chats.map((chat) => (
                <ChatSessionItem 
                  key={chat.id}
                  chat={chat}
                  onActivate={onSetActiveChat}
                  onSave={onSaveChat}
                  onDelete={onDeleteChat}
                  formatTime={formatTime}
                  collapsed={collapsed}
                  language={language}
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                    : "bg-white/60 text-purple-400 hover:bg-purple-100 border border-purple-200"
                }`}
                title={chat.title}
              >
                <MessageSquare size={16} />
                {chat.saved && (
                  <div className="absolute -top-1 -right-1">
                    <BookmarkCheck size={12} className="text-purple-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!collapsed && chats.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <MessageSquare size={28} className="text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {getText('No conversations', 'Hakuna mazungumzo')}
            </p>
            <p className="text-xs text-gray-500">
              {getText('Start a new chat', 'Anza mazungumzo mapya')}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
        {!collapsed ? (
          <div className="text-xs text-purple-600/80 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-medium">{getText('Encrypted & Anonymous', 'Imesimbwa na Bila Kukutambulisha')}</span>
            </div>
            <p className="text-xs text-purple-500/60">{getText('Privacy protected', 'Faragha imelindwa')}</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
  collapsed,
  language
}: { 
  chat: any;
  onActivate: (id: number) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  formatTime: (date: Date) => string;
  collapsed: boolean;
  language: "en" | "sw";
}) {
  if (collapsed) return null;

  const getText = (english: string, swahili: string) => {
    return language === 'sw' ? swahili : english;
  };

  return (
    <li>
      <button
        onClick={() => onActivate(chat.id)}
        className={`w-full text-left p-3 rounded-xl transition-all group border ${
          chat.active 
            ? "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md" 
            : "bg-white/60 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare size={14} className={`flex-shrink-0 ${
                chat.active ? "text-purple-600" : "text-purple-400"
              }`} />
              <span className={`text-sm font-medium truncate ${
                chat.active ? "text-purple-900" : "text-gray-700"
              }`}>
                {chat.title}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate mb-1.5 leading-relaxed">
              {chat.preview}
            </p>
            <div className="text-xs text-purple-500/70">
              {formatTime(chat.timestamp)}
            </div>
          </div>
          
          <div className="flex gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSave(chat.id);
              }}
              className={`p-1.5 rounded-lg transition ${
                chat.saved 
                  ? "text-purple-600 hover:text-purple-700 bg-purple-100" 
                  : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
              }`}
              title={chat.saved ? getText('Unsave chat', 'Futa uhifadhi') : getText('Save chat', 'Hifadhi mazungumzo')}
            >
              {chat.saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition rounded-lg"
              title={getText('Delete chat', 'Futa mazungumzo')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </button>
    </li>
  );
}