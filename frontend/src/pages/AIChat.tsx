import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Shield, Loader2, ArrowRight } from 'lucide-react';
import { caseService } from '../services/caseService';
import { aiService } from '../services/aiService';
import { InvestigationCase, ChatMessage } from '../types';

export const AIChat: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await caseService.getCases();
        if (res.cases && res.cases.length > 0) {
          setCases(res.cases);
          setSelectedCaseId(res.cases[0].id);
        }
      } catch (err) {
        console.warn('Load cases for chat error:', err);
      }
    };
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      // Seed welcome chat message
      setMessages([
        {
          id: 'welcome-1',
          case_id: selectedCaseId,
          sender: 'ai',
          message: `Hello Investigator. I am CrimeLens AI Copilot. Ask me anything regarding the evidence, suspects, vehicles, or contradictions for this case dossier.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || !selectedCaseId || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      case_id: selectedCaseId,
      sender: 'user',
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await aiService.askChat(selectedCaseId, query);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        case_id: selectedCaseId,
        sender: 'ai',
        message: res.reply || 'Evidence response generated.',
        sources: res.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What getaway vehicle was found?",
    "Summarize FIR document details",
    "Show case chronological timeline",
    "What contradictions exist in evidence?",
    "What evidence mentions Rahul Sharma?"
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">AI Multimodal Case Chatbot</h1>
            <p className="text-[11px] text-slate-400 font-mono">Answers derived strictly from case evidence context</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-mono text-slate-400">Target Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-400 font-semibold focus:outline-none focus:border-cyan-500"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} – {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold flex-shrink-0">
                <Bot className="h-4 w-4 stroke-[2.5]" />
              </div>
            )}

            <div
              className={`
                max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2
                ${msg.sender === 'user'
                  ? 'bg-cyan-500/10 text-slate-100 border border-cyan-500/30 rounded-tr-none'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'}
              `}
            >
              <div className="whitespace-pre-line">{msg.message}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400">Sources:</span>
                  {msg.sources.map((s, idx) => (
                    <span key={idx} className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 text-slate-300">
                      📄 {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono text-right">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-cyan-400 text-xs font-mono p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing multimodal evidence context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(promptText)}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{promptText}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI Copilot about vehicles, FIR, timeline, or contradictions..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
