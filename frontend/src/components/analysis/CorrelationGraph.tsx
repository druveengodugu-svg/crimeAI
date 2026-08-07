import React, { useState } from 'react';
import { Network, User, Car, MapPin, ShieldAlert, Package, ExternalLink, Sparkles } from 'lucide-react';
import { GraphNode, GraphEdge } from '../../types';

interface CorrelationGraphProps {
  caseId?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  summary?: string;
}

const DEFAULT_NODES: GraphNode[] = [
  { id: '1', label: 'Suspect A (Black Hoodie)', category: 'Person', sourceFile: 'CCTV Camera 04' },
  { id: '2', label: 'Dark SUV (Getaway)', category: 'Vehicle', sourceFile: 'CCTV & Witness Log' },
  { id: '3', label: 'Grand Vault Alley', category: 'Location', sourceFile: 'FIR Document' },
  { id: '4', label: '9mm Suppressed Pistol', category: 'Weapon', sourceFile: 'Ballistics Photo' },
  { id: '5', label: 'Witness: Bank Guard', category: 'Person', sourceFile: 'Audio Interview' }
];

const DEFAULT_EDGES: GraphEdge[] = [
  { source: '1', target: '2', relation: 'Fled scene driving away in', confidence: 96 },
  { source: '1', target: '4', relation: 'Discharged firearm inside vault', confidence: 98 },
  { source: '5', target: '2', relation: 'Reported screeching tires of', confidence: 92 },
  { source: '2', target: '3', relation: 'Captured on CCTV camera 04 at', confidence: 99 }
];

export const CorrelationGraph: React.FC<CorrelationGraphProps> = ({ 
  nodes = DEFAULT_NODES, 
  edges = DEFAULT_EDGES, 
  summary = 'Cross-modal correlation engine linked 5 primary evidence entities with high confidence matching scores.' 
}) => {
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
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 flex items-start space-x-3 shadow-lg">
          <Sparkles className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{summary}</p>
        </div>
      )}

      {/* Connected Evidence Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nodes List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
            <Network className="h-4 w-4 text-cyan-400" />
            Extracted Evidence Entities ({nodes.length})
          </h3>
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
                    p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between cyber-card
                    ${isSelected 
                      ? 'border-cyan-400 bg-slate-800 shadow-xl shadow-cyan-500/15 scale-[1.02]' 
                      : 'border-slate-800/80 hover:border-cyan-500/40'}
                  `}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${colorClass} flex-shrink-0 shadow-md`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate font-space">{node.label}</h4>
                      <p className="text-[10px] text-cyan-400 font-mono font-semibold">{node.category}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Edges & Linkages Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">Cross-Evidence Links ({edges.length})</h3>
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3 shadow-lg">
            {edges.map((edge, idx) => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);

              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{srcNode?.label || edge.source}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                      {edge.confidence}% match
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic font-mono">
                    ↳ {edge.relation}
                  </div>
                  <div className="font-bold text-slate-200">
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
