import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Zap,
  Brain,
  Check,
  Copy,
  ChevronDown,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessageItem = {
  id: 'welcome-msg',
  role: 'model',
  text: `Namaste! 👋 I'm **Freshy**, your AI Shopping & Produce Assistant at FreshMart.

How can I help you today?
• 🍎 **Find Fresh Produce**: Ask about seasonal fruits, greens, or prices.
• 🥗 **Recipe Ideas**: Tell me what's in your fridge or what you crave!
• ⏱️ **Store Info**: Learn about our 10-45 min delivery, free delivery over ₹499, and guarantees.
• 🌿 **Storage Tips**: How to keep herbs, tomatoes, and vegetables crisp for weeks.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  modelUsed: 'gemini-3.5-flash',
};

const SUGGESTED_QUESTIONS = [
  '🍎 What are the best seasonal fruits today?',
  '🥗 Give me a quick healthy dinner recipe with veggies',
  '⏱️ What are the delivery times and minimum order?',
  '🥦 Which vegetables are highest in Vitamin C & iron?',
  '🌿 How can I keep coriander and mint fresh longer?'
];

export const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('freshmart_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'fast' | 'complex'>('general');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('freshmart_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Listen to global open event
  useEffect(() => {
    const handleGlobalOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        setInputMessage(e.detail.query);
      }
    };
    window.addEventListener('open-freshmart-ai-chat', handleGlobalOpen as EventListener);
    return () => {
      window.removeEventListener('open-freshmart-ai-chat', handleGlobalOpen as EventListener);
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Format history turns (last 10 turns excluding initial prompt)
      const historyPayload = nextMessages
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await api.sendChatMessage({
        message: text,
        history: historyPayload,
        mode: chatMode,
      });

      if (response.success && response.data) {
        const botReply: ChatMessageItem = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: response.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: response.data.modelUsed,
        };
        setMessages((prev) => [...prev, botReply]);
        if (!isOpen) setHasUnread(true);
      } else {
        throw new Error('No response from AI service');
      }
    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `I'm having a brief connection issue. 🥦 Please check back shortly or feel free to browse our fresh categories!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'system-notice',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Reset conversation with Freshy?')) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      sessionStorage.removeItem('freshmart_chat_history');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple markdown renderer for clean bullet points and bold headers
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering
      let parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet list items
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5">
            <span className="text-emerald-500 font-bold shrink-0">•</span>
            <span
              className="text-neutral-800"
              dangerouslySetInnerHTML={{ __html: parsedLine.replace(/^[•\-]\s*/, '') }}
            />
          </div>
        );
      }
      // Blank lines for paragraphs
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="my-0.5 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parsedLine }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full shadow-lg shadow-emerald-700/25 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-400/30"
            aria-label="Open FreshMart AI Chat Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span>Ask Freshy AI</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900/60 text-emerald-200 px-1.5 py-0.2 rounded">
                  Gemini
                </span>
              </span>
              <span className="text-[10px] text-emerald-100 hidden sm:inline">
                Recipes & Produce Help
              </span>
            </div>

            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-neutral-200 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-x-auto md:right-6 md:bottom-6 md:top-12 md:w-[600px] md:h-[750px]'
              : 'bottom-3 right-3 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[400px] h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">Freshy AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-200 bg-white/10 px-1.5 py-0.5 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 truncate">
                  Produce Expert · Powered by Gemini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Minimize */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/60">
            {messages.map((item) => {
              const isUser = item.role === 'user';
              return (
                <div
                  key={item.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] space-y-1`}>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-[13px] ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {renderFormattedText(item.text)}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-neutral-400 px-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{item.timestamp}</span>
                      {item.modelUsed && !isUser && (
                        <span className="font-mono text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.2 rounded">
                          {item.modelUsed}
                        </span>
                      )}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-700 ml-1 inline-flex items-center gap-0.5"
                          title="Copy message"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Freshy is typing</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 pl-1">
              Suggestions:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-neutral-200 rounded-full text-[11px] text-neutral-700 whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer & Bottom Toolbar */}
          <div className="bg-white border-t border-neutral-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 pb-2 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about recipes, fruits, veggies, store delivery..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs shrink-0"
                title="Send message"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Bottom Bar: Brand indicator on left & Model Selector + Reset on bottom-right */}
            <div className="px-3 pb-2.5 pt-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Powered by Gemini</span>
              </div>

              {/* Bottom Right Section: [✨ General ˅] [🗑] */}
              <div className="flex items-center gap-1.5 relative">
                {/* Model Mode Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
                    title="Choose Gemini Model Mode"
                  >
                    {chatMode === 'fast' && <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    {chatMode === 'general' && <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {chatMode === 'complex' && <Brain className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    <span className="capitalize font-semibold">{chatMode}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-700" />
                  </button>

                  {showModeDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowModeDropdown(false)}
                      />
                      <div className="absolute right-0 bottom-full mb-1.5 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-30 text-neutral-800 text-xs animate-in fade-in slide-in-from-bottom-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                          Select Gemini Model
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setChatMode('general');
                            setShowModeDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-neutral-50 transition-colors ${
                            chatMode === 'general' ? 'bg-emerald-50 text-emerald-900 font-semibold' : ''
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">gemini-3.5-flash</div>
                            <div className="text-[10px] text-neutral-500 font-normal">
                              General smart shopping (Recommended)
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChatMode('fast');
                            setShowModeDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-neutral-50 transition-colors ${
                            chatMode === 'fast' ? 'bg-emerald-50 text-emerald-900 font-semibold' : ''
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">gemini-3.1-flash-lite</div>
                            <div className="text-[10px] text-neutral-500 font-normal">
                              Fast low-latency replies
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChatMode('complex');
                            setShowModeDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-neutral-50 transition-colors ${
                            chatMode === 'complex' ? 'bg-emerald-50 text-emerald-900 font-semibold' : ''
                          }`}
                        >
                          <Brain className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">gemini-3.1-pro-preview</div>
                            <div className="text-[10px] text-neutral-500 font-normal">
                              Complex culinary & diet planning
                            </div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Reset History / Trash */}
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Reset conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
