import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReflectionMode } from '../types';
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  Bot,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

interface AiChatCompanionProps {
  messages: ChatMessage[];
  onSendMessage: (userText: string, mode: ReflectionMode) => Promise<void>;
  sending: boolean;
  journalTitle: string;
  journalContent: string;
}

const QUICK_PROMPTS = [
  { label: 'Unpack My Reflection', text: 'Help me unpack the core thoughts and underlying emotions in this entry.', mode: 'reflect' as ReflectionMode, icon: HelpCircle },
  { label: 'Brainstorm Ideas', text: 'Based on what I wrote, brainstorm 3 creative or practical next steps.', mode: 'brainstorm' as ReflectionMode, icon: Lightbulb },
  { label: 'Cognitive Reframe', text: 'What is a constructive or positive way to reframe the challenges mentioned here?', mode: 'reflect' as ReflectionMode, icon: TrendingUp }
];

export const AiChatCompanion: React.FC<AiChatCompanionProps> = ({
  messages,
  onSendMessage,
  sending,
  journalTitle,
  journalContent
}) => {
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState<ReflectionMode>('reflect');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText('');
    await onSendMessage(text, activeMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPromptClick = (text: string, mode: ReflectionMode) => {
    setActiveMode(mode);
    onSendMessage(text, mode);
  };

  return (
    <aside className="w-full md:w-96 lg:w-[420px] bg-stone-50 border-l border-stone-200 flex flex-col h-[calc(100vh-4rem)] shrink-0">
      {/* Companion Header */}
      <div className="p-4 border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-stone-900 leading-tight">
                Gemini 3.6 Companion
              </h3>
              <p className="text-[11px] text-stone-500">Multi-Turn Reflection & Ideation</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            Resilient Engine
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-3 grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('reflect')}
            className={`py-1 rounded font-medium transition-colors ${
              activeMode === 'reflect'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Reflect
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('brainstorm')}
            className={`py-1 rounded font-medium transition-colors ${
              activeMode === 'brainstorm'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Brainstorm
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('summarize')}
            className={`py-1 rounded font-medium transition-colors ${
              activeMode === 'summarize'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Synthesize
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-2 text-amber-700">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-stone-800">
              Begin a Reflective Dialogue
            </h4>
            <p className="text-[11px] text-stone-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Write your entry and prompt Gemini to explore thoughts, brainstorm action steps, or synthesize your feelings.
            </p>

            {/* Suggested Starter Chips */}
            <div className="mt-5 space-y-2 text-left">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Suggested Prompts
              </p>
              {QUICK_PROMPTS.map((qp, idx) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickPromptClick(qp.text, qp.mode)}
                    disabled={sending}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-left text-xs text-stone-700 hover:text-stone-900 transition-all flex items-start space-x-2 shadow-2xs group"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5 group-hover:text-amber-600 transition-colors" />
                    <span className="leading-snug">{qp.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const formattedTime = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`flex items-center space-x-1.5 text-[10px] mb-1 ${
                    isUser ? 'text-stone-500' : 'text-stone-600'
                  }`}
                >
                  {isUser ? (
                    <>
                      <span>{formattedTime}</span>
                      <span className="font-semibold text-stone-800">You</span>
                      <UserIcon className="w-3 h-3 text-stone-500" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold text-stone-900">Gemini</span>
                      {msg.modelUsed && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-stone-200 text-stone-700 font-mono">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{formattedTime}</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[90%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {sending && (
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center space-x-1.5 text-[10px] text-stone-500">
              <Bot className="w-3 h-3 text-amber-600" />
              <span className="font-semibold text-stone-900">Gemini</span>
              <span className="text-stone-400">Thinking...</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl rounded-tl-xs p-3 shadow-2xs text-xs text-stone-500 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Analyzing entry & formulating reflection...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-200 bg-white">
        <div className="relative">
          <textarea
            id="chat-input-textarea"
            placeholder="Ask Gemini to brainstorm, critique, or reflect... (Enter to send)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={sending}
            className="w-full pr-10 pl-3 py-2 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white resize-none transition-all disabled:opacity-50"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={sending || !inputText.trim()}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Send prompt to Gemini"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400">
          <span>Mode: {activeMode.toUpperCase()}</span>
          <span>Saved to Firestore automatically</span>
        </div>
      </form>
    </aside>
  );
};
