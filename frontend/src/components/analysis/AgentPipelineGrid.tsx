import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Network, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Cpu
} from 'lucide-react';

interface AgentPipelineGridProps {
  caseId?: string;
  isAnalyzing?: boolean;
  activeStep?: number;
}

export const AgentPipelineGrid: React.FC<AgentPipelineGridProps> = ({ 
  isAnalyzing = false, 
  activeStep = 8 
}) => {
  const agents = [
    { id: 1, name: 'Document Analysis Agent', desc: 'OCR & FIR IPC Section Extraction', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Image Analysis Agent', desc: 'Gemini Vision Object & Weapon Detection', icon: ImageIcon, color: 'from-cyan-500 to-teal-500' },
    { id: 3, name: 'Video Analysis Agent', desc: 'CCTV Keyframe & Timestamp Tracking', icon: Video, color: 'from-teal-500 to-emerald-500' },
    { id: 4, name: 'Audio Analysis Agent', desc: 'Witness Voice Transcript & Audio Processing', icon: Mic, color: 'from-emerald-500 to-green-500' },
    { id: 5, name: 'Evidence Correlation Agent', desc: 'Cross-Modal Entity Graph Linkage', icon: Network, color: 'from-purple-500 to-indigo-500' },
    { id: 6, name: 'Timeline Generator Agent', desc: 'Chronological Sequence Mapping', icon: Clock, color: 'from-amber-500 to-yellow-500' },
    { id: 7, name: 'Contradiction Detection Agent', desc: 'Discrepancy & Verification Engine', icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
    { id: 8, name: 'Report Generator Agent', desc: 'Comprehensive Lead & PDF Synthesis', icon: FileSpreadsheet, color: 'from-cyan-500 to-blue-600' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          8-Agent Autonomous Multimodal Pipeline
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          All 8 Agents Active & Synchronized
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isDone = !isAnalyzing || activeStep > agent.id;
          const isCurrent = isAnalyzing && activeStep === agent.id;

          return (
            <div
              key={agent.id}
              className={`
                p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden cyber-card
                ${isCurrent 
                  ? 'border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02] glass-panel-glow' 
                  : isDone 
                  ? 'border-slate-800/80' 
                  : 'opacity-60'}
              `}
            >
              {/* Top Indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${agent.color} text-slate-950 font-bold shadow-md`}>
                  <Icon className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <div>
                  {isCurrent ? (
                    <span className="flex items-center text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing
                    </span>
                  ) : isDone ? (
                    <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-400" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Queued</span>
                  )}
                </div>
              </div>

              <h4 className="text-xs font-bold text-white tracking-wide mb-1 font-space">Agent {agent.id}: {agent.name}</h4>
              <p className="text-[11px] text-slate-400 leading-snug font-mono">{agent.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
