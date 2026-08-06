import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderPlus, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { caseService } from '../services/caseService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

export const NewInvestigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState(`CR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [firNumber, setFirNumber] = useState(`FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [officer, setOfficer] = useState(user?.full_name || 'Chief Insp. Marcus Vance');
  const [crimeType, setCrimeType] = useState('Armed Robbery & Homicide');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');

  // File Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleAutofillDemo = () => {
    setTitle('Grand Vault Armed Heist & Homicide');
    setCaseNumber('CR-2026-9041');
    setFirNumber('FIR-2026-0894');
    setDescription('Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.');
    setLocation('742 Financial Boulevard, Metro City');
    setOfficer('Chief Insp. Marcus Vance');
    setCrimeType('Armed Robbery & Homicide');
    setIncidentDate('2026-08-01');
    setPriority('Critical');
  };

  const handleLoadFullDemoCase = async () => {
    setIsSubmitting(true);
    setStatusMessage('Loading complete pre-analyzed demo case dossier...');
    try {
      const res = await caseService.loadDemoCase();
      if (res.case) {
        navigate(`/cases/${res.case.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load demo case');
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileCategoryIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'docx', 'doc', 'txt'].includes(ext)) return FileText;
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return ImageIcon;
    if (['mp4', 'avi', 'mov'].includes(ext)) return Video;
    if (['mp3', 'wav', 'm4a'].includes(ext)) return Mic;
    return FileText;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setUploadProgress(10);
    setStatusMessage('Creating investigation case record...');

    try {
      // Step 1: Create Case
      const caseRes = await caseService.createCase({
        title,
        case_number: caseNumber,
        fir_number: firNumber,
        description,
        location,
        officer,
        crime_type: crimeType,
        incident_date: incidentDate,
        priority
      });

      if (!caseRes.success || !caseRes.case) {
        throw new Error(caseRes.error || 'Failed to create case');
      }

      const caseId = caseRes.case.id;

      // Step 2: Upload Files (if selected)
      if (files.length > 0) {
        setUploadProgress(40);
        setStatusMessage(`Uploading ${files.length} evidence files securely...`);
        await caseService.uploadEvidence(caseId, files);
      }

      // Step 3: Trigger 8-Agent AI Multimodal Pipeline
      setUploadProgress(70);
      setStatusMessage('Dispatching 8-Agent Google Gemini AI Multimodal Analysis Swarm...');
      await aiService.runAnalysis(caseId);

      setUploadProgress(100);
      setStatusMessage('Analysis complete! Redirecting to case dossier...');

      setTimeout(() => {
        navigate(`/cases/${caseId}`);
      }, 800);
    } catch (err: any) {
      console.error('Case submission error:', err);
      setError(err.message || err.response?.data?.error || 'Failed to create investigation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <FolderPlus className="h-3.5 w-3.5" />
            <span>New Criminal Investigation Setup</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Investigation Case</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-400 hover:bg-slate-800 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Auto-fill Demo Data</span>
          </button>
          
          <button
            type="button"
            onClick={handleLoadFullDemoCase}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center space-x-1.5"
          >
            <Zap className="h-3.5 w-3.5 fill-slate-950 stroke-none" />
            <span>⚡ Direct Load Demo Dossier</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Case Metadata Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <h2 className="text-sm font-mono font-bold tracking-wider text-cyan-400 uppercase">1. Case Metadata Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Case Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Downtown Armored Vault Armed Heist"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Case ID Number *</label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">FIR Number *</label>
              <input
                type="text"
                required
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                placeholder="FIR-2026-0894"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300">Incident Overview & Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key details regarding the crime event, suspects involved, stolen items, or weapon discharge..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Crime Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="742 Financial Blvd, Metro City"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Lead Officer *</label>
              <input
                type="text"
                required
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Crime Classification *</label>
              <input
                type="text"
                required
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                placeholder="Armed Robbery / Homicide"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Incident Date *</label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">Priority Level</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evidence Drag-and-Drop Uploader */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold tracking-wider text-cyan-400 uppercase">2. Evidence Multimodal Uploads</h2>
            <span className="text-[11px] text-slate-400 font-mono">Multiple files supported</span>
          </div>

          {/* Supported Format Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-2 text-slate-300">
              <FileText className="h-4 w-4 text-blue-400" />
              <span>📄 FIR (PDF, DOCX)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-2 text-slate-300">
              <ImageIcon className="h-4 w-4 text-teal-400" />
              <span>📷 Photos (JPG, PNG)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Video className="h-4 w-4 text-emerald-400" />
              <span>📹 CCTV (MP4, AVI)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Mic className="h-4 w-4 text-amber-400" />
              <span>🎤 Audio (MP3, WAV)</span>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              p-8 rounded-2xl border-2 border-dashed text-center transition-all duration-200 cursor-pointer relative
              ${isDragging 
                ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10 scale-[1.01]' 
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'}
            `}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.mp4,.avi,.mov,.mp3,.wav,.m4a"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <UploadCloud className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Drag & drop evidence files here or click to browse</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Maximum file size: 100MB per file</p>
              </div>
            </div>
          </div>

          {/* Staged Uploaded Files Preview List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">Staged Files for AI Swarm ({files.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {files.map((file, idx) => {
                  const Icon = getFileCategoryIcon(file);
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Progress & Submit Bar */}
        {isSubmitting && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusMessage}
              </span>
              <span className="text-slate-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 hover:scale-105"
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            <span>Launch 8-Agent Multimodal Analysis</span>
          </button>
        </div>
      </form>
    </div>
  );
};
