"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, Sparkles } from "lucide-react";

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
  onSendMessage: (message: string) => Promise<string>;
  language: 'en' | 'sw';
}

export default function ChatWindow({
  activeChat,
  onUpdateChat,
  sidebarCollapsed,
  onSendMessage,
  language
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  const texts = {
    en: {
      messages: "messages",
      emptyChat: "Start a conversation with Vee",
      typeMessage: "Type your message...",
      send: "Send",
      typing: "Vee is typing...",
      saved: "Saved",
      listening: "I'm here to listen and provide support"
    },
    sw: {
      messages: "ujumbe",
      emptyChat: "Anza mazungumzo na Vee",
      typeMessage: "Andika ujumbe wako...",
      send: "Tuma",
      typing: "Vee anaandika...",
      saved: "Imehifadhiwa",
      listening: "Niko hapa kukusikiliza na kukupa msaada"
    }
  };

  const t = texts[language];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...activeChat.messages, userMessage];
    onUpdateChat(activeChat.id, updatedMessages);
    
    setInputMessage("");
    setIsLoading(true);

    try {
      const botResponse = await onSendMessage(inputMessage.trim());
      
      const botMessage: ChatMessage = {
        sender: "bot",
        text: botResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botMessage];
      onUpdateChat(activeChat.id, finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        sender: "bot",
        text: language === 'sw' 
          ? "Samahani, kuna hitilafu. Tafadhali jaribu tena." 
          : "Sorry, there was an error. Please try again.",
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      onUpdateChat(activeChat.id, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-purple-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {activeChat.title}
            </h2>
            <p className="text-xs text-purple-500/70 flex items-center gap-1.5">
              <span>{activeChat.messages.length - 1} {t.messages}</span>
              {activeChat.saved && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {t.saved}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-br from-white/50 to-purple-50/30">
        {activeChat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 flex items-center justify-center shadow-lg">
                <Bot size={36} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.emptyChat}</h3>
              <p className="text-sm text-gray-600">
                {t.listening}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {activeChat.messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.sender === "user" 
                      ? "bg-gradient-to-r from-blue-400 to-indigo-400" 
                      : "bg-gradient-to-r from-purple-400 to-pink-400"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User size={18} className="text-white" />
                  ) : (
                    <Bot size={18} className="text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
                      : "bg-white border border-purple-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    message.sender === "user" ? "text-blue-100" : "text-purple-400"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-bl-sm px-5 py-3 shadow-md">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t.typing}</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-purple-100 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.typeMessage}
                className="w-full px-4 py-3 border border-purple-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/90 text-gray-800 placeholder-purple-300"
                rows={1}
                style={{
                  minHeight: "48px",
                  maxHeight: "120px"
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-medium disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              <span className="hidden sm:inline">{t.send}</span>
            </button>
          </div>
          <p className="text-xs text-purple-500/60 text-center mt-2 flex items-center justify-center gap-1">
            <Sparkles size={12} />
            {language === 'sw' 
              ? "Bonyeza Enter kutuma, Shift+Enter kwa mstari mpya" 
              : "Press Enter to send, Shift+Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
}