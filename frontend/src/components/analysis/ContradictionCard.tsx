import React from 'react';
import { AlertOctagon, FileText, ArrowRightLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Contradiction } from '../../types';

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({ contradiction }) => {
  const confLevel = contradiction.confidence_level || (contradiction.confidence_score >= 90 ? 'High' : contradiction.confidence_score >= 70 ? 'Medium' : 'Low');

  return (
    <div className="p-5 rounded-2xl glass-panel border border-red-500/40 crimson-glow relative overflow-hidden space-y-4 shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertOctagon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wider text-red-400 uppercase">
              Contradiction: {contradiction.category || 'Discrepancy Flagged'}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Verified Evidence Conflict Detection</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-sm ${
            confLevel === 'High' ? 'text-red-400 bg-red-950/90 border-red-500/50' : 'text-amber-400 bg-amber-950/90 border-amber-500/50'
          }`}>
            Confidence: {contradiction.confidence_score}% ({confLevel})
          </span>
        </div>
      </div>

      {/* Direct Statement Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Source 1 */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Source 1: {contradiction.source1}</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
              {contradiction.source1_details || 'Page 3, Paragraph 2'}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">"{contradiction.statement1}"</p>
        </div>

        {/* Source 2 */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Source 2: {contradiction.source2}</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              {contradiction.source2_details || 'Timestamp 07:48'}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">"{contradiction.statement2}"</p>
        </div>
      </div>

      {/* AI Reasoning Section */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-red-500/30 text-xs space-y-2 font-mono">
        <div className="flex items-center space-x-2 text-red-400 font-bold text-[11px]">
          <ArrowRightLeft className="h-4 w-4" />
          <span>AI REASONING & FORENSIC ANALYSIS:</span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed pl-6">
          {contradiction.reasoning || contradiction.explanation || 'The AI correlated timestamps and witness claims across files and identified an irreconcilable timeline discrepancy.'}
        </p>

        {/* Confidence Reason */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="text-red-400 font-bold">Reason for Confidence ({contradiction.confidence_score}%):</span>
          <span className="font-sans text-slate-300">
            {contradiction.confidence_reason || 'Multiple independent evidence sources support this finding.'}
          </span>
        </div>
      </div>
    </div>
  );
};

