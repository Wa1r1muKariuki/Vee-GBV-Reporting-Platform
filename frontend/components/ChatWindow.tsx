"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";

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
      saved: "Saved"
    },
    sw: {
      messages: "ujumbe",
      emptyChat: "Anza mazungumzo na Vee",
      typeMessage: "Andika ujumbe wako...",
      send: "Tuma",
      typing: "Vee anaandika...",
      saved: "Imehifadhiwa"
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

    // Update chat with user message
    const updatedMessages = [...activeChat.messages, userMessage];
    onUpdateChat(activeChat.id, updatedMessages);
    
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get bot response
      const botResponse = await onSendMessage(inputMessage.trim());
      
      const botMessage: ChatMessage = {
        sender: "bot",
        text: botResponse,
        timestamp: new Date()
      };

      // Update chat with bot response
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
    <div className={`h-full flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
    }`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{activeChat.title}</h2>
            <p className="text-xs text-gray-500">
              {activeChat.messages.length - 1} {t.messages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeChat.saved && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                {t.saved}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
        {activeChat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Bot size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600">{t.emptyChat}</p>
              <p className="text-sm text-gray-400 mt-2">
                {language === 'sw' 
                  ? "Niko hapa kukusikiliza na kukupa msaada" 
                  : "I'm here to listen and provide support"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {activeChat.messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {message.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Loader2 size={16} className="animate-spin" />
                    {t.typing}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.typeMessage}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="hidden sm:inline">{t.send}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {language === 'sw' 
              ? "Bonyeza Enter kutuma, Shift+Enter kwa mstari mpya" 
              : "Press Enter to send, Shift+Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
}