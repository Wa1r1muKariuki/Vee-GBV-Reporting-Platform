"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Shield,
  Bot,
  User,
  ArrowUp,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Languages,
} from "lucide-react";

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

interface ChatWindowProps {
  activeChat: Chat;
  onUpdateChat: (chatId: number, newMessages: ChatMessage[]) => void;
  sidebarCollapsed: boolean;
  onSendToRasa: (message: string, language?: string) => Promise<string>;
}

export default function ChatWindow({
  activeChat,
  onUpdateChat,
  sidebarCollapsed,
  onSendToRasa,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRasaConnected, setIsRasaConnected] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [language, setLanguage] = useState<"en" | "sw">("en");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkRasaConnection();
  }, []);

  const checkRasaConnection = async () => {
    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "connection_test", message: "ping" }),
      });
      setIsRasaConnected(response.ok);
    } catch (error) {
      setIsRasaConnected(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeChat) return;

    const userMessage: ChatMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    const newMessages = [...activeChat.messages, userMessage];
    onUpdateChat(activeChat.id, newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const botResponseText = await onSendToRasa(input, language);

      const botMessage: ChatMessage = {
        sender: "bot",
        text: botResponseText,
        timestamp: new Date(),
      };

      onUpdateChat(activeChat.id, [...newMessages, botMessage]);
    } catch (error) {
      const fallback: ChatMessage = {
        sender: "bot",
        text:
          language === "en"
            ? "I'm here to support you. Please continue when you're ready."
            : "Nipo hapa kukusaidia. Tafadhali endelea unapokuwa tayari.",
        timestamp: new Date(),
      };
      onUpdateChat(activeChat.id, [...newMessages, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "sw" : "en"));
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat.messages]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const t = {
    en: {
      title: "Chat with Vee",
      subtitle: "Secure & Anonymous Support",
      placeholder: "Type your message...",
      secure: "Secure",
      aiPowered: "AI Powered • Secure & Anonymous",
      offlineMode: "Offline Mode • Basic Responses",
      expandChat: "Expand",
      collapseChat: "Collapse",
      aiConnected: "AI Connected",
      aiOffline: "AI Offline",
      messages: "messages",
    },
    sw: {
      title: "Zungumza na Vee",
      subtitle: "Usaidizi Salama na Usio na Utambulisho",
      placeholder: "Andika ujumbe wako...",
      secure: "Salama",
      aiPowered: "Inaendeshwa na AI • Salama na Isiyojulikana",
      offlineMode: "Hali ya Nje ya Mtandao • Majibu ya Msingi",
      expandChat: "Panua",
      collapseChat: "Funga",
      aiConnected: "AI Imeunganishwa",
      aiOffline: "AI Nje ya Mtandao",
      messages: "ujumbe",
    },
  }[language];

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex-shrink-0 flex justify-between items-center">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all duration-200"
        >
          <Languages size={12} />
          {language === "en" ? "SW" : "EN"}
        </button>

        <button
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all duration-200"
        >
          {isChatCollapsed ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )}
        </button>
      </div>

      {/* Chat Header */}
      <div
        className={`bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex-shrink-0 transition-all duration-300 ${
          isChatCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t.title}</h1>
              <p className="text-gray-300 text-sm">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl ${
                isRasaConnected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {isRasaConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isRasaConnected ? t.aiConnected : t.aiOffline}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              {activeChat.messages.length} {t.messages}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className={`flex-1 overflow-y-auto px-6 py-4 transition-all duration-300 ${
          isChatCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}
      >
        <div className="space-y-4">
          {activeChat.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-teal-500 to-green-500"
                      : "bg-black/40 backdrop-blur-lg border border-white/10"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User size={18} className="text-white" />
                  ) : (
                    <Bot size={18} className="text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-br-lg"
                        : "bg-black/40 backdrop-blur-lg border border-white/10 text-white rounded-bl-lg"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm break-words">
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-black/40 backdrop-blur-lg border border-white/10">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`border-t border-white/10 bg-black/40 backdrop-blur-xl p-4 flex-shrink-0 transition-all duration-300 ${
          isChatCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none transition-all text-white placeholder-gray-400 text-sm shadow-lg max-h-32"
              style={{ minHeight: "50px" }}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1 text-xs text-gray-400">
              <Shield size={10} />
              {t.secure}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-teal-500 to-green-500 text-white p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-teal-500/40 min-w-[50px] min-h-[50px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>

        <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1.5">
          <Shield size={10} />
          {isRasaConnected ? t.aiPowered : t.offlineMode}
        </div>
      </div>
    </div>
  );
}