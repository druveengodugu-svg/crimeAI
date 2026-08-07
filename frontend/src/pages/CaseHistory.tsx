import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FolderSearch, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  Trash2, 
  FolderPlus,
  Loader2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { caseService } from '../services/caseService';
import { InvestigationCase } from '../types';
import { Badge } from '../components/common/Badge';
import { soundFx } from '../utils/soundEffects';

export const CaseHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [crimeType, setCrimeType] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qStatus = searchParams.get('status') || '';
    const qSearch = searchParams.get('search') || '';
    setStatus(qStatus);
    setSearch(qSearch);
  }, [searchParams]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await caseService.getCases({ search, crimeType, status });
      if (res && Array.isArray(res.cases)) {
        setCases(res.cases);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.warn('Fetch cases error:', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [search, crimeType, status]);

  const handleDelete = async (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    soundFx.playClick();
    if (!window.confirm('Are you sure you want to delete this case dossier and its associated evidence?')) return;

    try {
      await caseService.deleteCase(caseId);
      soundFx.playSuccess();
      fetchCases();
    } catch (err) {
      console.error('Delete case error:', err);
    }
  };

  const handleQuickStatusChange = async (e: React.SyntheticEvent, caseId: string, newStatus: string) => {
    e.stopPropagation();
    soundFx.playClick();
    try {
      await caseService.updateCaseStatus(caseId, newStatus);
      soundFx.playSuccess();
      setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c)));
    } catch (err) {
      console.error('Quick status change error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono shadow-sm">
            <FolderSearch className="h-3.5 w-3.5" />
            <span>Master Case Repository</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-space">Case History & Dossiers</h1>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            navigate('/investigation/new');
          }}
          className="btn-cyber-primary text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-mono uppercase tracking-wider shadow-lg"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, case number, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono transition-colors"
          />
        </div>

        {/* Crime Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <select
            value={crimeType}
            onChange={(e) => {
              soundFx.playClick();
              setCrimeType(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono transition-colors cursor-pointer"
          >
            <option value="">All Crime Types</option>
            <option value="Armed Robbery & Homicide">Armed Robbery & Homicide</option>
            <option value="Cyber & Financial Fraud">Cyber & Financial Fraud</option>
            <option value="Kidnapping & Extortion">Kidnapping & Extortion</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => {
              soundFx.playClick();
              setStatus(e.target.value);
            }}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Solved">Solved</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3 text-cyan-400 font-mono">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-xs font-bold tracking-widest uppercase animate-pulse">Querying Case Database...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel border border-slate-800 text-center space-y-4 shadow-xl">
          <FolderPlus className="h-10 w-10 text-cyan-400/60 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-space">No Investigations Found</h3>
            <p className="text-xs text-slate-400 font-sans">Create a new case to upload evidence and trigger AI analysis.</p>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              navigate('/investigation/new');
            }}
            className="btn-cyber-primary text-xs px-4 py-2 rounded-xl font-mono uppercase shadow-lg"
          >
            Create Investigation Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                soundFx.playClick();
                navigate(`/cases/${c.id}`);
              }}
              className="cyber-card p-6 rounded-2xl cursor-pointer space-y-4 group relative shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                    {c.case_number}
                  </span>
                  {c.fir_number && (
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                      {c.fir_number}
                    </span>
                  )}
                  <Badge variant={c.priority === 'Critical' ? 'red' : 'amber'}>
                    {c.priority || 'High'}
                  </Badge>

                  {/* Case Status Badge / Dropdown */}
                  <select
                    value={c.status || 'Active'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleQuickStatusChange(e, c.id, e.target.value)}
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer appearance-none transition-all ${
                      c.status === 'Solved' || c.status === 'Closed'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50'
                        : c.status === 'Under Review'
                        ? 'bg-amber-950/90 text-amber-400 border-amber-500/50'
                        : c.status === 'Pending Trial'
                        ? 'bg-purple-950/90 text-purple-400 border-purple-500/50'
                        : 'bg-cyan-950/90 text-cyan-400 border-cyan-500/50'
                    }`}
                  >
                    <option value="Active" className="bg-slate-900 text-cyan-400">ACTIVE</option>
                    <option value="Under Review" className="bg-slate-900 text-amber-400">UNDER REVIEW</option>
                    <option value="Pending Trial" className="bg-slate-900 text-purple-400">PENDING TRIAL</option>
                    <option value="Solved" className="bg-slate-900 text-emerald-400">SOLVED ✅</option>
                  </select>
                </div>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Case"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between font-space">
                  <span>{c.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                  {c.summary || c.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                    <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                    {c.files_count || 4} Evidence Files
                  </span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {c.confidence_score}% Confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
