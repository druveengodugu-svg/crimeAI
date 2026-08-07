import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Shield, Loader2, ArrowRight, CheckCircle2, Cpu, FileText, AlertTriangle } from 'lucide-react';
import { caseService } from '../services/caseService';
import { aiService } from '../services/aiService';
import { InvestigationCase, ChatMessage } from '../types';
import { soundFx } from '../utils/soundEffects';

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
      setMessages([
        {
          id: 'welcome-1',
          case_id: selectedCaseId,
          sender: 'ai',
          message: `Hello Investigator. I am CrimeLens AI, an evidence-grounded investigation assistant. My knowledge is strictly restricted to the uploaded evidence of this active case dossier. I will answer only from the uploaded files for this case and refuse to use external knowledge.`,
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

    soundFx.playScanBeep();

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
      soundFx.playSuccess();
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
    "What is the proof?",
    "Why is this considered suspicious?",
    "Who is mentioned in the FIR?",
    "What vehicles appear in the CCTV?",
    "What contradictions exist in evidence?"
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-4 animate-fade-in pb-4">
      {/* Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Bot className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white font-space flex items-center gap-2">
              Explainable AI Investigation Copilot
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Evidence-Backed Reasoning
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Conclusions strictly supported by evidence references & transparent confidence scoring</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-mono text-slate-400">Case Dossier:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => {
              soundFx.playClick();
              setSelectedCaseId(e.target.value);
            }}
            className="px-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-cyan-400 font-bold font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
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
      <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <Bot className="h-4 w-4 stroke-[2.5]" />
              </div>
            )}

            <div
              className={`
                max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 shadow-md
                ${msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 border border-cyan-500/40 rounded-tr-none font-mono'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-tl-none font-sans'}
              `}
            >
              <div className="whitespace-pre-line leading-relaxed font-sans">{msg.message}</div>

              {msg.sender === 'ai' && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Shield className="h-3.5 w-3.5 text-cyan-400" /> Explainable AI Guardrail:
                  </span>
                  <span className="text-slate-400">All findings require human investigator verification</span>
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400 font-bold">Evidence Files Used:</span>
                  {msg.sources.map((s, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-cyan-300 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-cyan-400" /> {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono text-right">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex-shrink-0 shadow-md">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-cyan-400 text-xs font-mono p-4">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Cross-referencing evidence repository & synthesizing explainable reasoning...</span>
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
            className="px-3.5 py-1.5 rounded-xl glass-panel hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 text-[11px] font-mono whitespace-nowrap transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{promptText}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-3 shadow-xl">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI Copilot: What is the proof? Why is this suspicious? Who is mentioned in FIR?"
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          className="btn-cyber-primary p-2.5 rounded-xl text-slate-950 font-bold transition-all disabled:opacity-50 shadow-lg"
        >
          <Send className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

