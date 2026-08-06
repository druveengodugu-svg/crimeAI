import React, { useState } from 'react';
import { Network, User, Car, MapPin, ShieldAlert, Package, ExternalLink } from 'lucide-react';
import { GraphNode, GraphEdge } from '../../types';

interface CorrelationGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary?: string;
}

export const CorrelationGraph: React.FC<CorrelationGraphProps> = ({ nodes, edges, summary }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Person': return User;
      case 'Vehicle': return Car;
      case 'Location': return MapPin;
      case 'Weapon': return ShieldAlert;
      default: return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Person': return 'border-cyan-500 bg-cyan-500/10 text-cyan-400';
      case 'Vehicle': return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
      case 'Location': return 'border-purple-500 bg-purple-500/10 text-purple-400';
      case 'Weapon': return 'border-red-500 bg-red-500/10 text-red-400';
      default: return 'border-amber-500 bg-amber-500/10 text-amber-400';
    }
  };

  return (
    <div className="space-y-4">
      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-start space-x-3">
          <Network className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Connected Evidence Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nodes List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Extracted Evidence Entities ({nodes.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node) => {
              const Icon = getCategoryIcon(node.category);
              const colorClass = getCategoryColor(node.category);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`
                    p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between
                    ${isSelected 
                      ? 'border-cyan-400 bg-slate-800 shadow-md shadow-cyan-500/10 scale-[1.02]' 
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'}
                  `}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${colorClass} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{node.label}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{node.category}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Edges & Linkages Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Cross-Evidence Links ({edges.length})</h3>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            {edges.map((edge, idx) => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);

              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-cyan-400">{srcNode?.label || edge.source}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      {edge.confidence}% match
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono italic">
                    ↳ {edge.relation}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300">
                    {tgtNode?.label || edge.target}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
