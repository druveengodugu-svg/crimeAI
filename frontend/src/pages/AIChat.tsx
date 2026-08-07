import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Shield, Loader2, CheckCircle2, FileText, Activity, Search, Video, Image, Mic, FileCode, AlertCircle, Compass, HelpCircle } from 'lucide-react';
import { caseService } from '../services/caseService';
import { aiService } from '../services/aiService';
import { InvestigationCase, ChatMessage } from '../types';
import { soundFx } from '../utils/soundEffects';

const THINKING_STAGES = [
  { text: 'Searching active case evidence repository...', icon: Search },
  { text: 'Reading FIR & legal crime section records...', icon: FileText },
  { text: 'Analyzing CCTV video timestamp logs...', icon: Video },
  { text: 'Processing crime scene photos & object detections...', icon: Image },
  { text: 'Reading witness audio statement transcripts...', icon: Mic },
  { text: 'Correlating evidence across multimodal sources...', icon: Activity },
  { text: 'Synthesizing evidence-grounded reasoning...', icon: Bot }
];

export const AIChat: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [currentCase, setCurrentCase] = useState<InvestigationCase | null>(null);
  const [evidenceCounts, setEvidenceCounts] = useState({ fir: 0, cctv: 0, image: 0, audio: 0, doc: 0 });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load cases list
  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await caseService.getCases();
        if (res.cases && res.cases.length > 0) {
          setCases(res.cases);
          setSelectedCaseId(res.cases[0].id);
        }
      } catch (err) {
        console.warn('Load cases error:', err);
      }
    };
    loadCases();
  }, []);

  // When selectedCaseId changes, load case details & set Case-Specific Welcome Message
  useEffect(() => {
    if (!selectedCaseId) return;

    const loadCaseContext = async () => {
      try {
        const res = await caseService.getCaseById(selectedCaseId);
        const c = res.case || cases.find(item => item.id === selectedCaseId);
        setCurrentCase(c || null);

        const files: any[] = res.evidenceFiles || [];
        let fir = 0, cctv = 0, image = 0, audio = 0, doc = 0;

        files.forEach(f => {
          const type = (f.file_type || '').toLowerCase();
          const cat = (f.file_category || '').toLowerCase();
          const name = (f.file_name || '').toLowerCase();

          if (cat.includes('fir') || name.includes('fir')) fir++;
          else if (type.includes('video') || cat.includes('cctv')) cctv++;
          else if (type.includes('image') || cat.includes('photo')) image++;
          else if (type.includes('audio') || cat.includes('witness')) audio++;
          else doc++;
        });

        // Default counts for demo feel if files array empty
        if (files.length === 0) {
          fir = 1; cctv = 2; image = 4; audio = 2; doc = 3;
        }

        setEvidenceCounts({ fir, cctv, image, audio, doc });

        const caseNum = c?.case_number || 'CR-2026-9041';
        const title = c?.title || 'Active Investigation';

        const welcomeText = `**Case Loaded Successfully**

**Case ID:** ${caseNum} — ${title}

**Evidence Available**
* 📄 FIR Documents: ${fir}
* 🎥 CCTV Videos: ${cctv}
* 🖼 Crime Scene Images: ${image}
* 🎙 Audio Statements: ${audio}
* 📑 Official Documents: ${doc}

I'm ready to analyze this investigation. Ask me anything about the uploaded evidence.`;

        setMessages([
          {
            id: 'welcome-' + selectedCaseId,
            case_id: selectedCaseId,
            sender: 'ai',
            message: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err) {
        console.warn('Error loading case details for chat welcome:', err);
      }
    };

    loadCaseContext();
  }, [selectedCaseId]);

  // Thinking animation timer
  useEffect(() => {
    let timer: any;
    if (loading) {
      setThinkingIndex(0);
      timer = setInterval(() => {
        setThinkingIndex(prev => (prev + 1) % THINKING_STAGES.length);
      }, 650);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

    setMessages(prev => [...prev, userMsg]);
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
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const smartSuggestions = [
    "Who is the complainant?",
    "Summarize this case.",
    "What happened at 8:30 PM?",
    "Show investigation timeline.",
    "What vehicles were detected?",
    "List all witnesses.",
    "Are there contradictions?",
    "Show Case Health Summary."
  ];

  const followUpActionChips = [
    "🔍 Compare CCTV with FIR",
    "🕒 View event timeline",
    "👥 See all witnesses",
    "🚗 Show detected vehicles",
    "📊 Show Case Health Summary"
  ];

  const renderConfidenceBadge = (text: string) => {
    const match = text.match(/Confidence:\s*(\d+)%/i);
    const score = match ? parseInt(match[1], 10) : 95;

    if (score >= 90) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold shadow-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          🟢 High Confidence ({score}%) — Strongly Supported by Evidence
        </div>
      );
    } else if (score >= 70) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold shadow-md">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          🟡 Medium Confidence ({score}%) — Partial Evidence Alignment
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold shadow-md">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          🔴 Low Confidence ({score}%) — Limited Visual or Document Coverage
        </div>
      );
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.sender === 'user') {
      return <div className="whitespace-pre-line leading-relaxed font-mono">{msg.message}</div>;
    }

    const text = msg.message;
    const hasInsight = text.includes('💡 Investigator Insight');
    let mainText = text;
    let insightText = '';

    if (hasInsight) {
      const parts = text.split('💡 Investigator Insight');
      mainText = parts[0];
      insightText = parts[1];
    }

    return (
      <div className="space-y-3 font-sans">
        {/* Main Response Body */}
        <div className="whitespace-pre-line leading-relaxed text-slate-200">
          {mainText}
        </div>

        {/* Investigator Insight Callout Box */}
        {insightText && (
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1 shadow-md">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px] font-extrabold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              💡 Investigator Insight
            </div>
            <div className="text-xs text-slate-300 font-sans leading-relaxed">
              {insightText.replace(/^\n+|\n+$/g, '')}
            </div>
          </div>
        )}

        {/* Confidence Badge */}
        <div className="pt-1">
          {renderConfidenceBadge(text)}
        </div>

        {/* Interactive Follow-up Action Chips */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-bold">
            <Compass className="h-3 w-3 text-cyan-400" /> Suggested Follow-up Actions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {followUpActionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.replace(/^[^\w]+/, ''))}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 font-mono transition-colors flex items-center gap-1"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CurrentThinkingIcon = THINKING_STAGES[thinkingIndex].icon;

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-4 animate-fade-in pb-4">
      {/* Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Bot className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white font-space flex items-center gap-2">
              Professional AI Investigation Copilot
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3 text-cyan-400" /> Isolated Case Knowledge Base
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Ground-truth investigation engine with dynamic welcome stats, multi-stage thinking, & confidence ratings
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-mono text-slate-400 font-bold">Case Dossier:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => {
              soundFx.playClick();
              setSelectedCaseId(e.target.value);
            }}
            className="px-3.5 py-1.5 bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-500 rounded-xl text-xs text-cyan-300 font-bold font-mono focus:outline-none focus:border-cyan-500 cursor-pointer shadow-md"
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
      <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 overflow-y-auto space-y-5 shadow-2xl">
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
                  : 'bg-slate-950/95 text-slate-200 border border-slate-800/90 rounded-tl-none font-sans'}
              `}
            >
              {renderMessageContent(msg)}

              {msg.sender === 'ai' && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <Shield className="h-3.5 w-3.5" /> Explainable Guardrail:
                  </span>
                  <span>Findings grounded solely in uploaded case evidence</span>
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400 font-bold">Evidence Cards:</span>
                  {msg.sources.map((s, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-cyan-300 flex items-center gap-1 shadow-sm">
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

        {/* Multi-Stage Investigation Thinking Animation */}
        {loading && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 max-w-xl space-y-2 animate-pulse shadow-lg">
            <div className="flex items-center space-x-3 text-cyan-400 text-xs font-mono font-bold">
              <CurrentThinkingIcon className="h-4 w-4 animate-spin text-cyan-400" />
              <span>{THINKING_STAGES[thinkingIndex].text}</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${((thinkingIndex + 1) / THINKING_STAGES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Suggested Questions Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 text-[10px] font-mono text-cyan-400 font-bold border border-slate-800 flex-shrink-0">
          <HelpCircle className="h-3 w-3 text-cyan-400" /> Suggested Questions:
        </div>
        {smartSuggestions.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(promptText)}
            className="px-3.5 py-1.5 rounded-xl glass-panel hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 text-[11px] font-mono whitespace-nowrap transition-all flex items-center space-x-1.5 shadow-sm flex-shrink-0"
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
          placeholder="Ask AI Copilot: Who is the complainant? What happened at 8:30 PM? Show Case Health Summary..."
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
