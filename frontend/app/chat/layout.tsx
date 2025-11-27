"use client";

import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, Menu, FileText, XCircle, Globe } from "lucide-react";

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

export interface Chat {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Start expanded on desktop
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  
  const [sessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
       const stored = localStorage.getItem('vee_session_id');
       if (stored) return stored;
       
       const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
       localStorage.setItem('vee_session_id', newId);
       return newId;
    }
    return '';
  });

  // Load chats from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChats = localStorage.getItem('vee_chats');
      const savedLanguage = localStorage.getItem('vee_language');
      
      if (savedLanguage) {
        setLanguage(savedLanguage as 'en' | 'sw');
      }
      
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats);
          const chatsWithDates = parsedChats.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChats(chatsWithDates);
          
          const active = chatsWithDates.find((c: Chat) => c.active);
          if (active) {
            setActiveChat(active);
          } else if (chatsWithDates.length > 0) {
            const firstChat = { ...chatsWithDates[0], active: true };
            setChats(chatsWithDates.map((c: Chat, i: number) => i === 0 ? firstChat : c));
            setActiveChat(firstChat);
          }
        } catch (e) {
          console.error('Error loading chats:', e);
          initializeNewChat();
        }
      } else {
        initializeNewChat();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && chats.length > 0) {
      localStorage.setItem('vee_chats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vee_language', language);
    }
  }, [language]);

  const initializeNewChat = () => {
    const greeting = language === 'sw' 
      ? "👋 Habari, mimi ni Vee. Niko hapa kutoa nafasi salama na ya siri. Unaweza kuniambia kilichotokea, na nitakusaidia kupata msaada."
      : "👋 Hello, I'm Vee. I'm here to provide a safe, confidential space. You can tell me what happened, and I'll help you find support.";
    
    const newChat: Chat = {
      id: 1,
      title: language === 'sw' ? "Mazungumzo Mapya" : "New Chat",
      preview: language === 'sw' ? "Anza mazungumzo..." : "Start a new conversation...",
      timestamp: new Date(),
      saved: false,
      active: true,
      messages: [
        { 
          sender: "bot", 
          text: greeting, 
          timestamp: new Date() 
        }
      ]
    };
    
    setChats([newChat]);
    setActiveChat(newChat);
  };

  const handleNewChat = () => {
    const newChatId = Math.max(...chats.map(c => c.id), 0) + 1;
    const greeting = language === 'sw'
      ? "👋 Habari, mimi ni Vee. Niko hapa kusikiliza."
      : "👋 Hello, I'm Vee. I'm here to listen.";
    
    const newChat: Chat = {
      id: newChatId,
      title: language === 'sw' ? `Mazungumzo ${newChatId}` : `Chat ${newChatId}`,
      preview: language === 'sw' ? "Mazungumzo mapya..." : "New conversation...",
      timestamp: new Date(),
      saved: false,
      active: true,
      messages: [
        { 
          sender: "bot", 
          text: greeting, 
          timestamp: new Date() 
        }
      ]
    };
    
    const updatedChats = [newChat, ...chats.map(c => ({ ...c, active: false }))];
    setChats(updatedChats);
    setActiveChat(newChat);
    setSidebarOpen(false);
    setMenuOpen(false);
  };

  const handleSaveChat = (id: number) => {
    setChats(prevChats => 
      prevChats.map(c => c.id === id ? { ...c, saved: !c.saved } : c)
    );
  };

  const handleDeleteChat = (id: number) => {
    const filtered = chats.filter(c => c.id !== id);
    
    if (filtered.length > 0) {
      if (activeChat?.id === id) {
        const newActive = { ...filtered[0], active: true };
        setActiveChat(newActive);
        setChats(filtered.map((c, i) => i === 0 ? newActive : { ...c, active: false }));
      } else {
        setChats(filtered);
      }
    } else {
      handleNewChat();
    }
  };

  const handleSetActiveChat = (id: number) => {
    const updated = chats.map(c => ({ ...c, active: c.id === id }));
    const newActiveChat = updated.find(c => c.id === id) || null;
    
    setChats(updated);
    setActiveChat(newActiveChat);
    setSidebarOpen(false);
  };

  const updateChatMessages = (chatId: number, newMessages: ChatMessage[]) => {
    if (!newMessages || newMessages.length === 0) return;
    
    const lastMessage = newMessages[newMessages.length - 1];
    const preview = lastMessage?.text 
      ? (lastMessage.text.slice(0, 50) + (lastMessage.text.length > 50 ? "..." : ""))
      : "Empty message";
    
    const updated = chats.map(c => c.id === chatId ? { 
      ...c, 
      messages: newMessages,
      preview: preview,
      timestamp: new Date()
    } : c);
    
    setChats(updated);
    
    if (activeChat?.id === chatId) {
      setActiveChat(updated.find(c => c.id === chatId) || null);
    }
  };

  const sendMessageToVee = async (message: string): Promise<string> => {
    if (!message.trim()) {
      return language === 'sw' ? "Tafadhali ingiza ujumbe." : "Please enter a message.";
    }

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          message: message.trim(),
          session_id: sessionId,
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || (language === 'sw' 
        ? "Ninasikiliza, lakini nina shida kujibu. Tafadhali piga 1195."
        : "I am listening, but having trouble replying. Please call 1195.");

    } catch (error: any) {
      console.error("Chat connection error:", error);
      
      if (error.message.includes("Failed to fetch")) {
        return language === 'sw'
          ? "Siwezi kufikia seva. Tafadhali angalia kama backend inafanya kazi."
          : "I cannot reach the server. Please check if the backend is running.";
      }
      
      return language === 'sw'
        ? "Nina shida kuunganisha na seva salama. Kama uko hatarini, piga simu 999 au 1195 mara moja."
        : "I am having trouble connecting. If you are in danger, please call 999 or 1195 immediately.";
    }
  };

  const handleSafeExit = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    document.body.style.filter = "blur(20px)";
    setTimeout(() => {
      window.location.replace("https://www.google.com");
    }, 100);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Elegant Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Vee" 
              width={36} 
              height={36} 
              className="rounded-full shadow-md" 
            />
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline">
              Vee
            </span>
          </Link>

          {/* Center - Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition text-purple-700 text-sm font-medium shadow-sm"
          >
            <Globe size={16} />
            {language === 'en' ? 'English' : 'Kiswahili'}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-purple-100 transition"
          >
            <Menu size={22} className="text-purple-700" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-6 top-16 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100 py-2 w-56 animate-in slide-in-from-top-2">
            <Link 
              href="/resources" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition text-gray-700 text-sm"
            >
              <FileText size={18} className="text-purple-600" />
              {language === 'sw' ? 'Rasilimali' : 'Resources'}
            </Link>
            <Link 
              href="/map"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition text-gray-700 text-sm"
            >
              <Shield size={18} className="text-purple-600" />
              {language === 'sw' ? 'Ramani' : 'Map Insights'}
            </Link>
            <button
              onClick={handleSafeExit}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 text-sm"
            >
              <Shield size={18} />
              {language === 'sw' ? 'Toka Salama' : 'Safe Exit'}
            </button>
          </div>
        )}
      </header>

      <div className="flex h-full pt-16">
        {/* Sidebar - Light Pastel Colors */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            sidebarCollapsed ? 'w-20' : 'w-80'
          } lg:translate-x-0 transition-all duration-300 fixed lg:relative z-40 h-full bg-gradient-to-b from-purple-50/95 to-pink-50/95 backdrop-blur-xl border-r border-purple-100 shadow-lg`}
        >
          <ChatSidebar 
            chats={chats} 
            onNewChat={handleNewChat} 
            onSaveChat={handleSaveChat} 
            onDeleteChat={handleDeleteChat} 
            onSetActiveChat={handleSetActiveChat} 
            collapsed={sidebarCollapsed} 
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            language={language}
          />
        </div>

        {/* Chat Area - Soft Gradient Background */}
        <div className="flex-1 flex w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
          <div className="w-full h-full flex justify-center items-center p-6">
            <div className="bg-white/80 backdrop-blur-lg border border-purple-100 rounded-3xl shadow-2xl w-full max-w-6xl h-full overflow-hidden">
              {activeChat ? (
                <ChatWindow 
                  activeChat={activeChat} 
                  onUpdateChat={updateChatMessages}
                  sidebarCollapsed={sidebarCollapsed}
                  onSendMessage={sendMessageToVee}
                  language={language}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 flex items-center justify-center">
                      <Image 
                        src="/logo.png" 
                        alt="Vee" 
                        width={48} 
                        height={48} 
                        className="rounded-full"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {language === 'sw' ? 'Karibu Vee' : 'Welcome to Vee'}
                    </h3>
                    <p className="mb-6 text-gray-600 max-w-md mx-auto">
                      {language === 'sw' 
                        ? 'Anza mazungumzo kuanza. Uko salama hapa.' 
                        : 'Start a new conversation to begin. You are safe here.'}
                    </p>
                    <button 
                      onClick={handleNewChat} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full transition shadow-lg hover:shadow-xl font-medium"
                    >
                      {language === 'sw' ? 'Anza Mazungumzo' : 'Start New Chat'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Quick Exit Button */}
      <button 
        onClick={handleSafeExit} 
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-400 to-pink-400 text-white p-4 rounded-full shadow-2xl z-50 hover:shadow-red-300/50 transition-all hover:scale-110 group"
        title={language === 'sw' ? 'Toka Salama' : 'Quick Exit'}
      >
        <XCircle size={20} className="group-hover:rotate-90 transition-transform" />
      </button>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-24 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-2xl z-50 hover:shadow-purple-300/50 transition-all hover:scale-110"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}