import React from 'react';
import { Clock, FileText, Image as ImageIcon, Video, Mic, CheckCircle } from 'lucide-react';
import { TimelineEvent } from '../../types';

interface TimelineViewProps {
  caseId?: string;
  events?: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events = [] }) => {
  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'pdf': case 'doc': return FileText;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return Clock;
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 space-y-2">
        <Clock className="h-8 w-8 text-cyan-400/50 mx-auto" />
        <p className="text-xs text-slate-400 font-mono">No timeline events extracted yet. Run AI case analysis to build timeline sequence.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-blue-500 before:to-violet-600">
      {events.map((event, idx) => {
        const Icon = getSourceIcon(event.source_type);

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 top-1.5 h-5 w-5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-md shadow-cyan-500/30">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
            </div>

            {/* Card Content */}
            <div className="p-5 rounded-2xl cyber-card border border-slate-800 space-y-2.5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg shadow-sm">
                    {event.event_timestamp}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-wide font-space">{event.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  {event.source_name && (
                    <span className="flex items-center text-[10px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                      <Icon className="h-3 w-3 mr-1 text-cyan-400" />
                      {event.source_name}
                    </span>
                  )}
                  <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                    {event.confidence_score}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
