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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start minimized
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
          // Convert timestamp strings back to Date objects
          const chatsWithDates = parsedChats.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChats(chatsWithDates);
          
          // Set active chat
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

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && chats.length > 0) {
      localStorage.setItem('vee_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save language preference
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
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Minimalist Header with Hamburger */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Vee" 
              width={32} 
              height={32} 
              className="rounded-full shadow-sm" 
            />
            <span className="font-semibold text-gray-800 hidden sm:inline">Vee</span>
          </Link>

          {/* Center - Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition text-blue-700 text-sm font-medium"
          >
            <Globe size={14} />
            {language === 'en' ? 'English' : 'Kiswahili'}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-4 top-16 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 animate-in slide-in-from-top-2">
            <Link 
              href="/resources" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition text-gray-700 text-sm"
            >
              <FileText size={16} />
              {language === 'sw' ? 'Rasilimali' : 'Resources'}
            </Link>
            <Link 
              href="/map"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition text-gray-700 text-sm"
            >
              <Shield size={16} />
              {language === 'sw' ? 'Ramani' : 'Map Insights'}
            </Link>
            <button
              onClick={handleSafeExit}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 transition text-red-600 text-sm"
            >
              <Shield size={16} />
              {language === 'sw' ? 'Toka Salama' : 'Safe Exit'}
            </button>
          </div>
        )}
      </header>

      <div className="flex h-full pt-14">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            sidebarCollapsed ? 'w-16' : 'w-80'
          } lg:translate-x-0 transition-all duration-300 fixed lg:relative z-40 h-full bg-white/90 backdrop-blur-xl border-r border-gray-200`}
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

        {/* Chat Area */}
        <div className="flex-1 flex w-full bg-gradient-to-br from-white to-blue-50/30">
          <div className="w-full h-full flex justify-center p-4">
            <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg w-full max-w-5xl h-full overflow-hidden">
              {activeChat ? (
                <ChatWindow 
                  activeChat={activeChat} 
                  onUpdateChat={updateChatMessages}
                  sidebarCollapsed={sidebarCollapsed}
                  onSendMessage={sendMessageToVee}
                  language={language}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">
                      {language === 'sw' ? 'Anza mazungumzo kuanza.' : 'Start a new conversation to begin.'}
                    </p>
                    <button 
                      onClick={handleNewChat} 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full transition shadow-md"
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

      {/* Compact Quick Exit Button */}
      <button 
        onClick={handleSafeExit} 
        className="fixed bottom-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-full shadow-lg z-50 hover:shadow-xl transition-all hover:scale-110 group"
        title={language === 'sw' ? 'Toka Salama' : 'Quick Exit'}
      >
        <XCircle size={18} className="group-hover:rotate-90 transition-transform" />
      </button>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-20 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-600 transition"
      >
        <Menu size={18} />
      </button>
    </main>
  );
}