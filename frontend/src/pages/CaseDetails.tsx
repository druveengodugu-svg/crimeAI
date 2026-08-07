import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Network, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  Bot, 
  Sparkles, 
  Download, 
  ArrowLeft,
  Loader2,
  Trash2,
  CheckCircle2,
  UploadCloud,
  Eye,
  Search,
  Image,
  Film,
  Mic,
  MessageSquare,
  MapPin,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Plus,
  Cpu
} from 'lucide-react';
import { caseService } from '../services/caseService';
import { aiService } from '../services/aiService';
import { getFileUrl } from '../services/api';
import { InvestigationCase, EvidenceFile, TimelineEvent, Contradiction, InvestigationReport } from '../types';
import { Badge } from '../components/common/Badge';
import { AgentPipelineGrid } from '../components/analysis/AgentPipelineGrid';
import { CorrelationGraph } from '../components/analysis/CorrelationGraph';
import { TimelineView } from '../components/analysis/TimelineView';
import { ContradictionCard } from '../components/analysis/ContradictionCard';
import { ReportView } from '../components/analysis/ReportView';
import { UploadEvidenceModal } from '../components/evidence/UploadEvidenceModal';
import { EvidenceViewerModal } from '../components/evidence/EvidenceViewerModal';
import { soundFx } from '../utils/soundEffects';

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'graph' | 'timeline' | 'contradictions' | 'report'>('overview');
  const [caseObj, setCaseObj] = useState<InvestigationCase | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentStep, setAgentStep] = useState(1);
  const [analysisStageText, setAnalysisStageText] = useState('Analyzing Visual & Document Features...');

  // Evidence Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedEvidenceForView, setSelectedEvidenceForView] = useState<EvidenceFile | null>(null);
  const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    if (!caseObj || !id) return;
    soundFx.playClick();
    setUpdatingStatus(true);
    try {
      const res = await caseService.updateCaseStatus(id, newStatus);
      if (res.success) {
        soundFx.playSuccess();
        setCaseObj((prev) => (prev ? { ...prev, status: newStatus } : null));
        setStatusSuccessMessage(`Case status updated to "${newStatus}"!`);
        setTimeout(() => setStatusSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to update case status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await caseService.getCaseById(id);
      if (res.case) {
        setCaseObj(res.case);
        setEvidenceFiles(res.evidenceFiles || []);
        setTimeline(res.timeline || []);
        setContradictions(res.contradictions || []);
        setReport(res.report || null);
      }
    } catch (err) {
      console.warn('Failed to load case details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRunEntireCaseAnalysis = async () => {
    if (!id) return;
    soundFx.playScanBeep();
    setIsAnalyzing(true);
    setAgentStep(1);

    const stages = [
      'Analyzing Image Visual Observations...',
      'Running OCR & Document Parser...',
      'Transcribing Witness Audio Speech...',
      'Analyzing CCTV Frame Timelines...',
      'Correlating Cross-Evidence Entities...',
      'Building Chronological Case Timeline...',
      'Detecting Evidence Discrepancies...',
      'Synthesizing Formal Investigation Report...'
    ];

    const interval = setInterval(() => {
      soundFx.playScanBeep();
      setAgentStep((prev) => {
        const next = prev < 8 ? prev + 1 : 8;
        setAnalysisStageText(stages[next - 1] || stages[7]);
        return next;
      });
    }, 450);

    try {
      await aiService.runAnalysis(id);
      await fetchDetails();
      soundFx.playSuccess();
      setActiveTab('report');
    } catch (err) {
      console.error('Re-analysis error:', err);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeSingleEvidence = async (e: React.MouseEvent, evidenceId: string) => {
    e.stopPropagation();
    soundFx.playScanBeep();
    setAnalyzingFileId(evidenceId);
    try {
      await aiService.analyzeEvidenceFile(evidenceId);
      await fetchDetails();
      soundFx.playSuccess();
    } catch (err) {
      console.error('Single evidence AI analysis failed:', err);
    } finally {
      setAnalyzingFileId(null);
    }
  };

  const handleDeleteEvidence = async (e: React.MouseEvent, evidenceId: string, fileName: string) => {
    e.stopPropagation();
    soundFx.playClick();
    if (!window.confirm(`Are you sure you want to permanently delete evidence file "${fileName}"?`)) return;
    try {
      await caseService.deleteEvidence(evidenceId);
      await fetchDetails();
      soundFx.playSuccess();
    } catch (err) {
      console.error('Delete evidence error:', err);
    }
  };

  const handleDeleteCase = async () => {
    soundFx.playClick();
    if (!id || !window.confirm('Are you sure you want to delete this entire investigation case?')) return;
    try {
      await caseService.deleteCase(id);
      soundFx.playSuccess();
      navigate('/cases');
    } catch (err) {
      console.error('Delete case error:', err);
    }
  };

  // Helper to render Evidence Type Icon
  const getEvidenceIcon = (file: EvidenceFile) => {
    const type = (file.file_type || '').toLowerCase();
    const cat = (file.file_category || '').toLowerCase();

    if (type === 'image' || cat.includes('photo') || cat.includes('image')) {
      return <Image className="h-5 w-5 text-cyan-400" />;
    }
    if (type === 'video' || cat.includes('cctv') || cat.includes('video')) {
      return <Film className="h-5 w-5 text-indigo-400" />;
    }
    if (type === 'audio' || cat.includes('witness') || cat.includes('audio')) {
      return <Mic className="h-5 w-5 text-amber-400" />;
    }
    if (cat.includes('chat') || type === 'chat') {
      return <MessageSquare className="h-5 w-5 text-emerald-400" />;
    }
    if (cat.includes('location') || type === 'location') {
      return <MapPin className="h-5 w-5 text-rose-400" />;
    }
    if (type === 'pdf' || cat.includes('fir')) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    }
    return <FileCode className="h-5 w-5 text-slate-400" />;
  };

  // Filtered Evidence Files
  const filteredEvidence = (evidenceFiles || []).filter((file) => {
    const matchesSearch =
      !searchQuery ||
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.file_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'fir' && (file.file_category.toLowerCase().includes('fir') || file.file_type === 'pdf')) ||
      (categoryFilter === 'photo' && (file.file_type === 'image' || file.file_category.toLowerCase().includes('photo'))) ||
      (categoryFilter === 'video' && (file.file_type === 'video' || file.file_category.toLowerCase().includes('cctv'))) ||
      (categoryFilter === 'audio' && (file.file_type === 'audio' || file.file_category.toLowerCase().includes('audio'))) ||
      (categoryFilter === 'chat' && file.file_category.toLowerCase().includes('chat')) ||
      (categoryFilter === 'location' && file.file_category.toLowerCase().includes('location'));

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3 text-cyan-400 font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="text-xs font-bold tracking-widest uppercase animate-pulse">Loading Case Evidence Repository...</span>
      </div>
    );
  }

  if (!caseObj) {
    return (
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 shadow-2xl">
        <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto animate-bounce" />
        <h2 className="text-lg font-bold text-white font-mono">Case Dossier Not Found</h2>
        <button
          onClick={() => navigate('/cases')}
          className="btn-cyber-primary text-xs px-4 py-2 rounded-xl font-mono uppercase"
        >
          Return to Case History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Multi-Stage Loading Scanner Animation Header when Analyzing */}
      {isAnalyzing && (
        <div className="p-5 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 shadow-2xl space-y-3 animate-pulse glass-panel-glow">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Cpu className="h-4 w-4 animate-spin text-cyan-400" />
              <span className="uppercase tracking-wider">Multimodal AI Agent Pipeline Running (Stage {agentStep}/8)</span>
            </div>
            <span className="text-cyan-300">{Math.round((agentStep / 8) * 100)}%</span>
          </div>
          <p className="text-xs font-mono text-cyan-200">{analysisStageText}</p>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${(agentStep / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Top Bar: Back Link & Primary Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => {
            soundFx.playClick();
            navigate('/cases');
          }}
          className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case History</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {caseObj.status !== 'Solved' && caseObj.status !== 'Closed' && (
            <button
              onClick={() => handleStatusChange('Solved')}
              disabled={updatingStatus}
              className="btn-cyber-emerald text-xs px-4 py-2 rounded-xl flex items-center space-x-2 font-mono uppercase shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
              <span>Mark Solved ✅</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              setIsUploadOpen(true);
            }}
            className="flex items-center space-x-2 glass-panel hover:bg-slate-800/80 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>Upload Evidence</span>
          </button>

          <button
            onClick={handleRunEntireCaseAnalysis}
            disabled={isAnalyzing}
            className="btn-cyber-primary text-xs px-5 py-2 rounded-xl flex items-center space-x-2 font-mono uppercase shadow-lg"
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            <span>{isAnalyzing ? 'Synthesizing Pipeline...' : 'Analyze Entire Case'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              navigate('/chat');
            }}
            className="p-2 rounded-xl glass-panel border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
            title="Chat with Case Evidence"
          >
            <Bot className="h-4 w-4" />
          </button>

          <button
            onClick={handleDeleteCase}
            className="p-2 rounded-xl glass-panel border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Investigation Case"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {statusSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center justify-between shadow-xl animate-fade-in font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{statusSuccessMessage}</span>
          </div>
          <button
            onClick={() => setStatusSuccessMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Case Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-xl shadow-sm">
              CASE ID: {caseObj.case_number}
            </span>

            {caseObj.fir_number && (
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-xl">
                FIR NO: {caseObj.fir_number}
              </span>
            )}

            {/* Interactive Status Selector Dropdown */}
            <div className="relative">
              <select
                value={caseObj.status || 'Active'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`font-mono text-xs font-black px-3 py-1 rounded-xl border focus:outline-none cursor-pointer appearance-none transition-all ${
                  caseObj.status === 'Solved' || caseObj.status === 'Closed'
                    ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                    : caseObj.status === 'Under Review'
                    ? 'bg-amber-950/90 text-amber-400 border-amber-500/50'
                    : caseObj.status === 'Pending Trial'
                    ? 'bg-purple-950/90 text-purple-400 border-purple-500/50'
                    : 'bg-cyan-950/90 text-cyan-400 border-cyan-500/50'
                }`}
              >
                <option value="Active" className="bg-slate-900 text-cyan-400">STATUS: ACTIVE INVESTIGATION</option>
                <option value="Under Review" className="bg-slate-900 text-amber-400">STATUS: UNDER REVIEW</option>
                <option value="Pending Trial" className="bg-slate-900 text-purple-400">STATUS: PENDING COURT TRIAL</option>
                <option value="Solved" className="bg-slate-900 text-emerald-400">STATUS: SOLVED / CLOSED ✅</option>
              </select>
            </div>

            <Badge variant={caseObj.priority === 'Critical' ? 'red' : 'amber'} size="md">
              {caseObj.priority || 'High'} Priority
            </Badge>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {caseObj.confidence_score}% Confidence
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Incident Date: {caseObj.incident_date}
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-space">{caseObj.title}</h1>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{caseObj.description}</p>
        </div>

        <div className="flex flex-wrap items-center space-x-6 text-xs text-slate-400 pt-3 border-t border-slate-800/80 font-mono">
          <span>📍 Location: <strong className="text-white">{caseObj.location}</strong></span>
          <span>👮 Officer: <strong className="text-white">{caseObj.officer}</strong></span>
          <span>⚖️ Crime Type: <strong className="text-cyan-400">{caseObj.crime_type}</strong></span>
          <span>📁 Total Evidence: <strong className="text-white">{evidenceFiles.length} files stored</strong></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1 font-mono">
        {[
          { id: 'overview', label: `Evidence Repository (${evidenceFiles.length})`, icon: FileText },
          { id: 'agents', label: '8-Agent AI Swarm', icon: Sparkles },
          { id: 'graph', label: 'Correlation Graph', icon: Network },
          { id: 'timeline', label: `Timeline (${timeline.length})`, icon: Clock },
          { id: 'contradictions', label: `Contradictions (${contradictions.length})`, icon: AlertTriangle },
          { id: 'report', label: 'AI Investigation Report', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border-t border-x
                ${isActive 
                  ? 'bg-slate-900/90 text-cyan-400 border-cyan-500/50 shadow-sm font-bold' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="space-y-6">
        {/* 1. EVIDENCE REPOSITORY TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800 shadow-lg">
              <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-1.5 w-full sm:w-72">
                <Search className="h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Filter evidence by name, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
                {[
                  { id: 'all', label: 'All Files' },
                  { id: 'fir', label: 'FIR & Docs' },
                  { id: 'photo', label: 'Photos' },
                  { id: 'video', label: 'CCTV Videos' },
                  { id: 'audio', label: 'Witness Audio' },
                  { id: 'chat', label: 'Chat Exports' },
                  { id: 'location', label: 'Location Logs' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Cards Grid */}
            {filteredEvidence.length === 0 ? (
              <div className="p-12 text-center glass-panel border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                <UploadCloud className="h-10 w-10 text-cyan-400/50 mx-auto" />
                <h3 className="text-sm font-bold text-white font-space">No Evidence Files Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                  Upload images, videos, witness audio, FIR documents, chat logs, or location files to populate the Evidence Repository.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="btn-cyber-primary text-xs px-4 py-2 rounded-xl font-mono uppercase shadow-lg"
                >
                  Upload First Evidence File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvidence.map((file) => {
                  const isAnalyzingThis = analyzingFileId === file.id;
                  const status = file.ai_status || 'Pending';

                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedEvidenceForView(file)}
                      className="cyber-card p-5 rounded-2xl cursor-pointer space-y-4 relative shadow-xl flex flex-col justify-between"
                    >
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 truncate">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30">
                            {getEvidenceIcon(file)}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate font-space">
                              {file.file_name}
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                              {file.file_category}
                            </span>
                          </div>
                        </div>

                        {/* AI Analysis Status Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                            status === 'Completed'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                              : status === 'Analyzing'
                              ? 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {status === 'Completed' ? '✓ AI Analyzed' : status === 'Analyzing' ? 'Analyzing...' : 'AI Pending'}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        <div className="flex justify-between">
                          <span>File Size:</span>
                          <strong className="text-slate-200">{(file.file_size / 1024 / 1024).toFixed(2)} MB</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Uploaded:</span>
                          <strong className="text-slate-200">{new Date(file.uploaded_at).toLocaleDateString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Uploaded By:</span>
                          <strong className="text-cyan-400">{file.uploaded_by || 'Investigator'}</strong>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {file.tags?.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* 4 Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvidenceForView(file);
                          }}
                          className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-cyan-950/40 font-mono"
                          title="Open Interactive Evidence Viewer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => handleAnalyzeSingleEvidence(e, file.id)}
                          disabled={isAnalyzingThis}
                          className="flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-amber-950/40 font-mono"
                          title="Trigger AI Analysis on this file"
                        >
                          {isAnalyzingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          <span>Analyze</span>
                        </button>

                        <a
                          href={getFileUrl(file.file_path)}
                          download={file.file_name}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 font-mono"
                          title="Download File"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={(e) => handleDeleteEvidence(e, file.id, file.file_name)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. AGENT PIPELINE GRID TAB */}
        {activeTab === 'agents' && (
          <AgentPipelineGrid caseId={caseObj.id} isAnalyzing={isAnalyzing} />
        )}

        {/* 3. CORRELATION GRAPH TAB */}
        {activeTab === 'graph' && (
          <CorrelationGraph caseId={caseObj.id} />
        )}

        {/* 4. TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <TimelineView events={timeline} caseId={caseObj.id} />
        )}

        {/* 5. CONTRADICTIONS TAB */}
        {activeTab === 'contradictions' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Flagged Evidence Discrepancies & Contradictions ({contradictions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contradictions.map((c) => (
                <ContradictionCard key={c.id} contradiction={c} />
              ))}
            </div>
          </div>
        )}

        {/* 6. INVESTIGATION REPORT TAB */}
        {activeTab === 'report' && (
          <ReportView report={report} caseObj={caseObj} />
        )}
      </div>

      {/* Upload Evidence Modal */}
      <UploadEvidenceModal
        caseId={caseObj.id}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => fetchDetails()}
      />

      {/* Evidence Viewer Modal */}
      {selectedEvidenceForView && (
        <EvidenceViewerModal
          evidence={selectedEvidenceForView}
          onClose={() => setSelectedEvidenceForView(null)}
          onTriggerAnalysis={fetchDetails}
        />
      )}
    </div>
  );
};
