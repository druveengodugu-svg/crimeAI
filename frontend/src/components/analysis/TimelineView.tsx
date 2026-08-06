import React from 'react';
import { Clock, FileText, Image as ImageIcon, Video, Mic, CheckCircle } from 'lucide-react';
import { TimelineEvent } from '../../types';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'pdf': case 'doc': return FileText;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return Clock;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-600 before:to-slate-800">
      {events.map((event, idx) => {
        const Icon = getSourceIcon(event.source_type);

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 top-1.5 h-5 w-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-md shadow-cyan-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
            </div>

            {/* Card Content */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                    {event.event_timestamp}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-wide">{event.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  {event.source_name && (
                    <span className="flex items-center text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      <Icon className="h-3 w-3 mr-1 text-slate-300" />
                      {event.source_name}
                    </span>
                  )}
                  <span className="flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                    <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                    {event.confidence_score}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
