import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderSearch, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  Trash2, 
  FolderPlus,
  Loader2,
  FileCheck
} from 'lucide-react';
import { caseService } from '../services/caseService';
import { InvestigationCase } from '../types';
import { Badge } from '../components/common/Badge';

export const CaseHistory: React.FC = () => {
  const navigate = useNavigate();

  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [search, setSearch] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Are you sure you want to delete this case and its associated evidence?')) return;

    try {
      await caseService.deleteCase(caseId);
      fetchCases();
    } catch (err) {
      console.error('Delete case error:', err);
    }
  };

  const handleQuickStatusChange = async (e: React.SyntheticEvent, caseId: string, newStatus: string) => {
    e.stopPropagation();
    try {
      await caseService.updateCaseStatus(caseId, newStatus);
      setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c)));
    } catch (err) {
      console.error('Quick status change error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <FolderSearch className="h-3.5 w-3.5" />
            <span>Master Case Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Case History & Dossiers</h1>
        </div>

        <button
          onClick={() => navigate('/investigation/new')}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, case number, or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Crime Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <select
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
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
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
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
        <div className="h-64 flex items-center justify-center space-x-3 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-mono">Loading cases...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <FolderPlus className="h-10 w-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Investigations Found</h3>
            <p className="text-xs text-slate-400">Create a new case to upload evidence and trigger AI analysis.</p>
          </div>
          <button
            onClick={() => navigate('/investigation/new')}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
          >
            Create Investigation Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all duration-200 space-y-4 group relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                    {c.case_number}
                  </span>
                  {c.fir_number && (
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
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
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer appearance-none transition-all ${
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
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{c.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {c.summary || c.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                    {c.files_count || 4} Evidence Files
                  </span>
                </div>
                <span className="text-emerald-400 font-bold">
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
