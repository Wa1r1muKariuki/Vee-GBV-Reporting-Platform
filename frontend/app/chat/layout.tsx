"use client";

import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, Menu, FileText } from "lucide-react";

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface Chat {
  id: number;
  title: string;
  preview: string;
  timestamp: Date;
  saved: boolean;
  active: boolean;
  messages: ChatMessage[];
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Initialize with empty chat when component mounts
  useEffect(() => {
    const newChat: Chat = {
      id: 1,
      title: "New Chat",
      preview: "Start a new conversation...",
      timestamp: new Date(),
      saved: false,
      active: true,
      messages: [
        { 
          sender: "bot", 
          text: "👋 Hello, I'm Vee. I'm here to provide a safe, confidential space for you to share your concerns. You can speak with me anonymously about any incident, and I'll guide you through support options and resources.", 
          timestamp: new Date() 
        }
      ]
    };
    
    setChats([newChat]);
    setActiveChat(newChat);
  }, []);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: chats.length + 1,
      title: `Chat ${chats.length + 1}`,
      preview: "New conversation started...",
      timestamp: new Date(),
      saved: false,
      active: true,
      messages: [
        { 
          sender: "bot", 
          text: "👋 Hello, I'm Vee. I'm here to provide a safe, confidential space for you to share your concerns. You can speak with me anonymously about any incident, and I'll guide you through support options and resources.", 
          timestamp: new Date() 
        }
      ]
    };
    
    setChats(prevChats => [newChat, ...prevChats.map(chat => ({ ...chat, active: false }))]);
    setActiveChat(newChat);
    setSidebarOpen(false);
  };

  const handleSaveChat = (id: number) => {
    setChats(chats.map(chat => 
      chat.id === id ? { ...chat, saved: !chat.saved } : chat
    ));
  };

  const handleDeleteChat = (id: number) => {
    const filteredChats = chats.filter(chat => chat.id !== id);
    if (filteredChats.length > 0) {
      const newActiveChat = { ...filteredChats[0], active: true };
      setActiveChat(newActiveChat);
      setChats(filteredChats.map((chat, index) => 
        index === 0 ? newActiveChat : { ...chat, active: false }
      ));
    } else {
      setActiveChat(null);
      setChats([]);
    }
  };

  const handleSetActiveChat = (id: number) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      active: chat.id === id
    }));
    setChats(updatedChats);
    setActiveChat(updatedChats.find(chat => chat.id === id) || null);
    setSidebarOpen(false);
  };

  const updateChatMessages = (chatId: number, newMessages: ChatMessage[]) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: newMessages,
            preview: newMessages[newMessages.length - 1]?.text.slice(0, 50) + "..." || "New messages..."
          }
        : chat
    );
    setChats(updatedChats);
    
    if (chatId === activeChat?.id) {
      setActiveChat(updatedChats.find(chat => chat.id === chatId) || null);
    }
  };

  const sendMessageToRasa = async (message: string): Promise<string> => {
    try {
      // Get last 5 messages for context
      const conversationHistory = activeChat?.messages.slice(-5).map(msg => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp
      })) || [];

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          language: "en",
          conversation_history: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "Thank you for sharing. I'm here to support you.";

    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Fallback responses for when the backend is unavailable
      const fallbackResponses = [
        "I understand this might be difficult to talk about. Take your time.",
        "Thank you for sharing that with me. How are you feeling right now?",
        "I'm here to listen. Your safety and well-being are important.",
        "Would you like me to help you explore some support options?",
        "I understand this must be challenging. Remember you're not alone."
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const handleSafeExit = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.body.style.filter = "blur(8px)";
      setTimeout(() => window.location.replace("https://www.google.com"), 150);
    } catch {
      window.location.replace("https://www.google.com");
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <header className="fixed top-4 left-0 w-full z-50 flex justify-center items-center">
        {/* Floating Nav Container */}
        <nav className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-full px-8 py-2 shadow-2xl flex items-center justify-center space-x-8 text-white">
          <Link
            href="/resources"
            className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide"
          >
            Resources
          </Link>
          <Link
            href="/map"
            className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide"
          >
            Map Insights
          </Link>
          <Link
            href="/safe-exit"
            className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide flex items-center gap-1"
            onClick={handleSafeExit}
          >
            <Shield size={12} />
            Safe Exit
          </Link>
          <Link
            href="/report"
            className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide flex items-center gap-1"
          >
            <FileText size={12} />
            Quick Report
          </Link>
        </nav>

        {/* Floating Logo Far Left */}
        <div className="absolute left-6 top-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Vee logo"
              width={44}
              height={44}
              className="rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all duration-300"
              priority
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="absolute right-6 top-0 lg:hidden">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-green-500 px-3 py-1.5 rounded-full font-semibold shadow-lg hover:scale-105 transition-all text-white text-xs"
          >
            <Menu size={14} />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-full pt-20">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${sidebarCollapsed ? 'w-16' : 'w-80'}
          lg:translate-x-0 transition-all duration-300 ease-in-out
          fixed lg:relative z-40 h-full bg-black/40 backdrop-blur-xl border-r border-white/10
        `}>
          <ChatSidebar 
            chats={chats}
            onNewChat={handleNewChat}
            onSaveChat={handleSaveChat}
            onDeleteChat={handleDeleteChat}
            onSetActiveChat={handleSetActiveChat}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'
        }`}>
          <div className="w-full h-full flex justify-center items-start pt-4 px-4">
            <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col w-full max-w-6xl">
              {activeChat ? (
                <ChatWindow 
                  activeChat={activeChat}
                  onUpdateChat={updateChatMessages}
                  sidebarCollapsed={sidebarCollapsed}
                  onSendToRasa={sendMessageToRasa}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-white">
                  <div className="text-center">
                    <p>No active chat. Start a new conversation.</p>
                    <button 
                      onClick={handleNewChat}
                      className="mt-4 bg-gradient-to-r from-teal-500 to-green-500 px-4 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition-all text-white"
                    >
                      Start New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}