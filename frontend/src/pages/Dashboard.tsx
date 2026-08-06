import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderSearch, 
  FolderPlus, 
  FileCheck, 
  ShieldAlert, 
  Network, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Bot, 
  Plus,
  Zap,
  ChevronRight,
  Loader2,
  CheckCircle2,
  FileText,
  Activity,
  CheckSquare,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { InvestigationCase } from '../types';
import { Badge } from '../components/common/Badge';

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
  const aiCompletedCount = cases.length * 4; // AI runs per file

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>CrimeLens AI Digital Forensic Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{user?.full_name || 'Chief Investigator'}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Law Enforcement evidence management & investigation workspace. Upload multi-source digital evidence, maintain persistent case archives, and synthesize cross-modal intelligence with AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 flex-shrink-0">
          <button
            onClick={handleLoadDemoCase}
            disabled={loadingDemo}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            {loadingDemo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-slate-950 stroke-[2]" />
            )}
            <span>⚡ Open Active Demo Heist</span>
          </button>

          <button
            onClick={() => navigate('/investigation/new')}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Investigation Case</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Cases</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderSearch className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{cases.length}</div>
          <p className="text-[10px] text-slate-400">All registered case files</p>
        </div>

        {/* Active Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase">Active Cases</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{activeCasesCount}</div>
          <p className="text-[10px] text-slate-400">Ongoing active inquiries</p>
        </div>

        {/* Closed Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase">Closed / Solved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{closedCasesCount}</div>
          <p className="text-[10px] text-slate-400">Completed & archived</p>
        </div>

        {/* Evidence Files */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-blue-400 uppercase">Evidence Files</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalEvidenceCount}</div>
          <p className="text-[10px] text-slate-400">Images, CCTV, Audio, PDFs</p>
        </div>

        {/* AI Analyses Completed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-400 uppercase">AI Analyses</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{aiCompletedCount}</div>
          <p className="text-[10px] text-slate-400">Gemini agent outputs</p>
        </div>
      </div>

      {/* Main Grid: Cases List & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-wider text-slate-200 uppercase font-mono flex items-center gap-2">
              <FolderSearch className="h-4 w-4 text-cyan-400" />
              Active Investigations
            </h2>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All ({cases.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {(cases || []).slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all duration-200 space-y-3 group shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                      {c.case_number}
                    </span>
                    {c.fir_number && (
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                        {c.fir_number}
                      </span>
                    )}
                    <Badge variant={c.priority === 'Critical' ? 'red' : 'amber'}>
                      {c.priority || 'High'} Priority
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Incident: {c.incident_date}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{c.title}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.summary || c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-4">
                    <span>📍 {c.location}</span>
                    <span>👮 {c.officer}</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-bold">
                    {c.confidence_score}% Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Activity & Recent Uploads */}
        <div className="space-y-6">
          {/* Recent Uploads Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" /> Recent Uploads
            </h3>
            <div className="space-y-2.5">
              {[
                { name: 'FIR_Report_BankHeist.pdf', type: 'PDF Document', size: '1.02 MB', time: 'Just now' },
                { name: 'CCTV_Camera04_Alleyway.mp4', type: 'CCTV Video', size: '15.4 MB', time: '10m ago' },
                { name: 'CrimeScene_VaultDoor.jpg', type: 'Crime Scene Photo', size: '3.20 MB', time: '25m ago' },
                { name: 'Witness_Guard_Interview.mp3', type: 'Witness Audio', size: '4.50 MB', time: '1h ago' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-mono text-white text-[11px] font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.type} • {item.size}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" /> Case Activity Stream
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-semibold">Single Evidence AI Analysis</p>
                  <p className="text-[11px] text-slate-400">Image scene & object detection complete</p>
                  <p className="text-[10px] text-slate-500 font-mono">5 mins ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-semibold">Full Case Synthesis Generated</p>
                  <p className="text-[11px] text-slate-400">8-Agent swarm report ready</p>
                  <p className="text-[10px] text-slate-500 font-mono">20 mins ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-semibold">Getaway Vehicle Contradiction</p>
                  <p className="text-[11px] text-slate-400">Witness audio vs CCTV video</p>
                  <p className="text-[10px] text-slate-500 font-mono">40 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
