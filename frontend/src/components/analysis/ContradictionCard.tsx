import React from 'react';
import { AlertOctagon, FileText, ArrowRightLeft } from 'lucide-react';
import { Contradiction } from '../../types';

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({ contradiction }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-red-500/40 crimson-glow relative overflow-hidden space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertOctagon className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold font-mono tracking-wider text-red-400 uppercase">
            {contradiction.category || 'Contradiction Flagged'}
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 border border-red-500/40 px-2.5 py-0.5 rounded-full">
          {contradiction.confidence_score}% Discrepancy Confidence
        </span>
      </div>

      {/* Direct Statement Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400">
            <FileText className="h-3 w-3" />
            <span>Source 1: {contradiction.source1}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">"{contradiction.statement1}"</p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-amber-400">
            <FileText className="h-3 w-3" />
            <span>Source 2: {contradiction.source2}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">"{contradiction.statement2}"</p>
        </div>
      </div>

      {/* Forensic Explanation */}
      <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-xs text-red-200 flex items-start space-x-2">
        <ArrowRightLeft className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-red-400">Analysis: </span>
          <span>{contradiction.explanation}</span>
        </div>
      </div>
    </div>
  );
};
