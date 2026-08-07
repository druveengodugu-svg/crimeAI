import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderSearch, 
  FolderPlus, 
  FileCheck, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Plus,
  Zap,
  ChevronRight,
  Loader2,
  FileText,
  Activity,
  CheckSquare,
  Upload,
  Cpu,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { InvestigationCase } from '../types';
import { Badge } from '../components/common/Badge';
import { soundFx } from '../utils/soundEffects';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await caseService.getCases();
      if (res && Array.isArray(res.cases)) {
        setCases(res.cases);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.warn('Dashboard cases fetch error:', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleLoadDemoCase = async () => {
    soundFx.playClick();
    setLoadingDemo(true);
    try {
      const res = await caseService.loadDemoCase();
      if (res.case && res.case.id) {
        navigate(`/cases/${res.case.id}`);
      } else {
        navigate('/cases/11111111-1111-1111-1111-111111111111');
      }
    } catch (err) {
      console.error('Load demo case error:', err);
      navigate('/cases/11111111-1111-1111-1111-111111111111');
    } finally {
      setLoadingDemo(false);
    }
  };

  const activeCasesCount = cases.filter((c) => c.status !== 'Solved' && c.status !== 'Archived').length;
  const closedCasesCount = cases.filter((c) => c.status === 'Solved' || c.status === 'Archived').length;
  const totalEvidenceCount = cases.reduce((acc, c) => acc + (c.files_count || 4), 0);
  const aiCompletedCount = cases.length * 4;

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/70 border border-cyan-500/35 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl cyan-glow">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span className="font-semibold">CrimeLens AI Digital Forensic Intelligence Workspace</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight font-space">
            Welcome back, <span className="gradient-text">{user?.full_name || 'Chief Investigator'}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
            Multi-source digital evidence management & AI investigation workspace. Synthesize cross-modal intelligence across image, video, audio, and FIR document evidence seamlessly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 flex-shrink-0">
          <button
            onClick={handleLoadDemoCase}
            disabled={loadingDemo}
            className="btn-cyber-emerald text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-mono uppercase tracking-wider shadow-lg"
          >
            {loadingDemo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-slate-950 stroke-[2]" />
            )}
            <span>⚡ Open Demo Case</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              navigate('/investigation/new');
            }}
            className="btn-cyber-primary text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-mono uppercase tracking-wider shadow-lg"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cases */}
        <div
          onClick={() => {
            soundFx.playClick();
            navigate('/cases');
          }}
          className="cyber-card p-5 rounded-2xl cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400 uppercase font-bold tracking-wider transition-colors">Total Cases</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <FolderSearch className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">{cases.length}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Registered dossiers</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">View All →</span>
          </div>
        </div>

        {/* Active Cases */}
        <div
          onClick={() => {
            soundFx.playClick();
            navigate('/cases?status=Active');
          }}
          className="cyber-card p-5 rounded-2xl cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold tracking-wider">Active / Pending</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{activeCasesCount}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Ongoing inquiries</span>
            <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">Open Active →</span>
          </div>
        </div>

        {/* Closed Cases */}
        <div
          onClick={() => {
            soundFx.playClick();
            navigate('/cases?status=Solved');
          }}
          className="cyber-card p-5 rounded-2xl cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Closed / Solved</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{closedCasesCount}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Completed & solved</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">Open Solved →</span>
          </div>
        </div>

        {/* Evidence Files */}
        <div
          onClick={() => {
            soundFx.playClick();
            navigate('/cases');
          }}
          className="cyber-card p-5 rounded-2xl cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-400 uppercase font-bold tracking-wider">Evidence Files</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <FileCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalEvidenceCount}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Images, CCTV, Audio, PDFs</span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">Inspect →</span>
          </div>
        </div>

        {/* AI Agent Runs */}
        <div
          onClick={() => {
            soundFx.playClick();
            navigate('/cases');
          }}
          className="cyber-card p-5 rounded-2xl cursor-pointer space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-purple-400 uppercase font-bold tracking-wider">AI Analyses</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Cpu className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">{aiCompletedCount}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Multimodal agent runs</span>
            <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">View →</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Cases & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-2">
              <FolderSearch className="h-4 w-4 text-cyan-400" />
              Active Investigations
            </h2>
            <button
              onClick={() => {
                soundFx.playClick();
                navigate('/cases');
              }}
              className="text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View All ({cases.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cyber-card p-6 rounded-2xl space-y-3">
                    <div className="h-4 w-1/3 skeleton-box rounded" />
                    <div className="h-6 w-3/4 skeleton-box rounded" />
                    <div className="h-12 w-full skeleton-box rounded" />
                  </div>
                ))}
              </div>
            ) : cases.length === 0 ? (
              <div className="cyber-card p-8 rounded-2xl text-center space-y-4">
                <ShieldAlert className="h-10 w-10 text-cyan-400 mx-auto opacity-60" />
                <p className="text-sm font-mono text-slate-300">No active cases found. Launch a new investigation or open the pre-built demo case.</p>
                <button onClick={handleLoadDemoCase} className="btn-cyber-emerald text-xs px-4 py-2 rounded-xl font-mono">
                  ⚡ Launch Demo Case
                </button>
              </div>
            ) : (
              (cases || []).slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    soundFx.playClick();
                    navigate(`/cases/${c.id}`);
                  }}
                  className="cyber-card p-5 md:p-6 rounded-2xl cursor-pointer space-y-3 group shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                        {c.case_number}
                      </span>
                      {c.fir_number && (
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-lg">
                          {c.fir_number}
                        </span>
                      )}
                      <Badge variant={c.priority === 'Critical' ? 'red' : 'amber'}>
                        {c.priority || 'High'} Priority
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Incident: {c.incident_date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between font-space">
                      <span>{c.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                      {c.summary || c.description}
                    </p>
                  </div>

                  {/* Confidence Progress Meter */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">AI Confidence Rating</span>
                      <span className="text-emerald-400 font-bold">{c.confidence_score || 94}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${c.confidence_score || 94}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                    <div className="flex items-center space-x-4">
                      <span>📍 {c.location}</span>
                      <span>👮 {c.officer}</span>
                    </div>
                    <span className="text-cyan-400 text-[11px] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Inspect Dossier →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Uploads & Stream */}
        <div className="space-y-6">
          {/* Recent Evidence Uploads Widget */}
          <div className="p-5 rounded-2xl glass-panel space-y-4 shadow-lg border border-slate-800">
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" /> Recent Uploads
            </h3>
            <div className="space-y-2.5">
              {[
                { name: 'FIR_Report_BankHeist.pdf', type: 'PDF Document', size: '1.02 MB', time: 'Just now' },
                { name: 'CCTV_Camera04_Alleyway.mp4', type: 'CCTV Video', size: '15.4 MB', time: '10m ago' },
                { name: 'CrimeScene_VaultDoor.jpg', type: 'Crime Scene Photo', size: '3.20 MB', time: '25m ago' },
                { name: 'Witness_Guard_Interview.mp3', type: 'Witness Audio', size: '4.50 MB', time: '1h ago' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs hover:border-cyan-500/40 transition-all group">
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="truncate">
                      <p className="font-mono text-white text-[11px] font-medium truncate group-hover:text-cyan-300">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.type} • {item.size}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="p-5 rounded-2xl glass-panel space-y-4 shadow-lg border border-slate-800">
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" /> Case Activity Stream
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-start space-x-3 group">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0 animate-ping"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-bold group-hover:text-cyan-400 transition-colors">Evidence-Specific AI Analysis</p>
                  <p className="text-[11px] text-slate-400 font-sans">Image visual observations & OCR extracted</p>
                  <p className="text-[10px] text-slate-500">5 mins ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-bold group-hover:text-emerald-400 transition-colors">8-Agent Swarm Synthesized</p>
                  <p className="text-[11px] text-slate-400 font-sans">Full case investigation report compiled</p>
                  <p className="text-[10px] text-slate-500">20 mins ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 mt-1 flex-shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-bold group-hover:text-amber-400 transition-colors">Vehicle Contradiction Flagged</p>
                  <p className="text-[11px] text-slate-400 font-sans">Witness audio vs CCTV 1080p video</p>
                  <p className="text-[10px] text-slate-500">40 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
