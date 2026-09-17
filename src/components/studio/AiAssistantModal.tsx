import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Lightbulb, Code2, BookOpen, Bot } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your Liquid Glass Studio AI study copilot. How can I assist you with your CS50 Python, Mobile Application, or WebGL Three.js courses today?',
    },
  ]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setPrompt('');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Generate intelligent academic feedback
    timeoutRef.current = setTimeout(() => {
      let aiResponse = '';
      if (text.toLowerCase().includes('python') || text.toLowerCase().includes('cs50')) {
        aiResponse =
          'In CS50 Python, functions use snake_case naming conventions and type annotations help prevent subtle runtime bugs. Try structuring your next assignment with pytest fixtures to test edge cases.';
      } else if (text.toLowerCase().includes('shader') || text.toLowerCase().includes('glass') || text.toLowerCase().includes('three')) {
        aiResponse =
          "To achieve optical dispersion in GLSL, calculate separate refractive indices (e.g. IOR 1.95 - 0.04 for red, +0.04 for blue). Evaluating Snell's law per channel creates crisp spectral highlights along curved bezels.";
      } else {
        aiResponse =
          'Great question! Breaking your study time into 25-minute Pomodoro intervals followed by active recall note synthesis yields an average 35% higher concept retention rate.';
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <div
      id="ai-assistant-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 animate-fade-in"
    >
      <div
        id="ai-assistant-modal-content"
        className="relative w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl text-white overflow-hidden flex flex-col h-[85vh] sm:h-[75vh]"
        style={{
          background: 'linear-gradient(135deg, rgba(25, 20, 50, 0.55) 0%, rgba(12, 16, 32, 0.7) 100%)',
          boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">AI Studio Assistant</h2>
              <p className="text-xs text-slate-400 truncate">Context-aware academic synthesis & coding tutor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600/40 border border-purple-400/40 text-purple-200'
                }`}
              >
                {m.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600/80 text-white rounded-tr-none'
                    : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Prompts */}
        <div className="px-6 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-black/20">
          <button
            onClick={() => handleSend('Explain Snell\'s Law in WebGL shaders')}
            className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Code2 className="w-3 h-3 text-cyan-400" /> Snell's Law in WebGL
          </button>
          <button
            onClick={() => handleSend('Summarize CS50 Python Lecture 1 Conditionals')}
            className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-blue-400" /> CS50 Lecture Summary
          </button>
          <button
            onClick={() => handleSend('How does React Native JSI work?')}
            className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" /> React Native JSI
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your courses, code, or study schedule..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-black/30 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
