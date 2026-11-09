import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Brain,
  Zap,
  Music,
  Sliders,
  ListPlus,
  Bot,
  User,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Song } from '../types/music';

interface GeminiChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  onQueueSongs: (songTitles: string[]) => void;
}

export const GeminiChatSheet: React.FC<GeminiChatSheetProps> = ({
  isOpen,
  onClose,
  currentSong,
  onQueueSongs,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey! I'm **IMusic AI**, your native audio curator & acoustic companion. I can build custom playlists for your mood, break down song themes, explain optimal 5-band EQ settings, or optimize your audio queue. What would you like to explore?",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [enableThinking, setEnableThinking] = useState(false);
  const [appliedPlaylistId, setAppliedPlaylistId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Build server request payload with history and model choice
      const payload = {
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        model: enableThinking ? 'gemini-4-argon' : selectedModel,
        enableThinking,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `I hit a small bump: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPresetPlaylist = (msgId: string) => {
    onQueueSongs(['Cyan Horizon', 'Aether Flow', 'Neon Drift']);
    setAppliedPlaylistId(msgId);
    setTimeout(() => setAppliedPlaylistId(null), 3000);
  };

  const promptStarters = [
    { label: 'Generate Late Night Playlist', query: 'Recommend a 5-track nocturnal Synthwave & Lo-Fi playlist for driving under neon city lights.' },
    { label: 'Optimal 5-Band EQ Settings', query: 'What are the best 5-band equalizer gains (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz) for punchy electronic music with deep sub-bass?' },
    { label: 'Analyze Current Track', query: currentSong ? `Analyze the musical style and mood of "${currentSong.title}" by ${currentSong.artist}.` : 'What musical elements create the feeling of liquid ambient music?' },
    { label: 'Deep Reasoning (High Thinking)', query: 'Conduct an in-depth musicological comparison between retro 1980s analog synth production and modern 2020s cyber electronic music engineering.', isComplex: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-xl h-[88vh] rounded-t-3xl sm:rounded-3xl bg-[#090a10] border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/25">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">IMusic AI DJ</h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {enableThinking ? 'gemini-4-argon' : selectedModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Curator, Sound Engineer & Musicologist</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* High Thinking Toggle */}
            <button
              onClick={() => {
                const nextState = !enableThinking;
                setEnableThinking(nextState);
                if (nextState) {
                  setSelectedModel('gemini-4-argon');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                enableThinking
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold shadow-md shadow-cyan-400/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
              title="Enable High Thinking for complex reasoning queries"
            >
              <Brain className={`w-3.5 h-3.5 ${enableThinking ? 'animate-pulse' : ''}`} />
              <span>Thinking: {enableThinking ? 'HIGH' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model Switcher Bar */}
        <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Active Engine:</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setSelectedModel('gemini-3.8-flash');
                setEnableThinking(false);
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                selectedModel === 'gemini-3.8-flash' && !enableThinking
                  ? 'bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'hover:text-white'
              }`}
            >
              3.8 Flash (General)
            </button>
            <button
              onClick={() => {
                setSelectedModel('gemini-3.1-flash-lite');
                setEnableThinking(false);
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                selectedModel === 'gemini-3.1-flash-lite' && !enableThinking
                  ? 'bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'hover:text-white'
              }`}
            >
              3.1 Lite (Fast)
            </button>
            <button
              onClick={() => {
                setSelectedModel('gemini-4-argon');
                setEnableThinking(true);
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                selectedModel === 'gemini-4-argon' || enableThinking
                  ? 'bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'hover:text-white'
              }`}
            >
              4 Argon (High Thinking)
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const hasRecommendations =
              !isUser &&
              (msg.content.includes('1.') ||
                msg.content.includes('2.') ||
                msg.content.toLowerCase().includes('track') ||
                msg.content.toLowerCase().includes('playlist'));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-400 text-black font-medium rounded-tr-sm shadow-md shadow-cyan-400/10'
                      : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Apply Playlist Button if AI suggested music */}
                  {hasRecommendations && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-cyan-300 flex items-center gap-1 font-medium">
                        <Music className="w-3 h-3" />
                        Music recommendations detected
                      </span>
                      <button
                        onClick={() => handleApplyPresetPlaylist(msg.id)}
                        disabled={appliedPlaylistId === msg.id}
                        className="px-2.5 py-1 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                      >
                        {appliedPlaylistId === msg.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            <span>Queued in IMusic!</span>
                          </>
                        ) : (
                          <>
                            <ListPlus className="w-3 h-3" />
                            <span>Queue in Player</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && !isUser && <span>{msg.modelUsed}</span>}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-spin">
                <Loader2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span>{enableThinking ? 'IMusic AI reasoning with high thinking...' : 'Generating music insights...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Starters */}
        <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-black/30">
          {promptStarters.map((starter, i) => (
            <button
              key={i}
              onClick={() => {
                if (starter.isComplex) {
                  setEnableThinking(true);
                  setSelectedModel('gemini-4-argon');
                }
                handleSendMessage(starter.query);
              }}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs whitespace-nowrap border border-white/5 transition-all flex items-center gap-1.5"
            >
              {starter.isComplex && <Brain className="w-3 h-3 text-cyan-400" />}
              <span>{starter.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-black/60 border-t border-white/10 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              enableThinking
                ? 'Ask a complex musical query (High Thinking active)...'
                : 'Ask about songs, EQ tuning, playlists...'
            }
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-cyan-400 disabled:opacity-40 hover:bg-cyan-300 text-black flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-lg shadow-cyan-400/20"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
