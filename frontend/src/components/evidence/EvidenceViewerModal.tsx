import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  Sparkles,
  Download,
  FileText,
  Bot,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { EvidenceFile, EvidenceAnalysis } from '../../types';
import { aiService } from '../../services/aiService';

interface EvidenceViewerModalProps {
  evidence: EvidenceFile | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: () => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  evidence,
  isOpen,
  onClose,
  onAnalysisComplete
}) => {
  if (!isOpen || !evidence) return null;

  // Active View Mode inside Modal: 'preview' or 'ai_analysis'
  const [activeSideTab, setActiveSideTab] = useState<'preview' | 'ai_analysis'>('preview');

  // AI Analysis state
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false);

  // Image Controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Video Controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Controls
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Document Text Search
  const [searchQuery, setSearchQuery] = useState('');
  const [documentText, setDocumentText] = useState<string>('');

  // Fetch Existing AI Analysis for file
  useEffect(() => {
    if (evidence) {
      // Reset controls
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsPlaying(false);
      setAudioPlaying(false);
      setSearchQuery('');

      // Fetch AI Analysis details
      setLoadingAnalysis(true);
      aiService.getReport(evidence.case_id)
        .then(() => {
          // Attempt fetching specific evidence analysis
          return fetch(`/api/evidence/${evidence.id}`);
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.analysis) {
            setAnalysis(data.analysis);
          } else {
            setAnalysis(null);
          }
        })
        .catch(() => setAnalysis(null))
        .finally(() => setLoadingAnalysis(false));

      // Mock or fetch raw document text for preview if document
      if (evidence.file_type === 'pdf' || evidence.file_type === 'docx' || evidence.file_type === 'txt') {
        setDocumentText(
          `FIRST INFORMATION REPORT (FIR) - CRIME SCENE EVIDENCE
Case Number: ${evidence.case_id}
File Name: ${evidence.file_name}
Uploaded By: ${evidence.uploaded_by || 'Officer'}
Upload Date: ${new Date(evidence.uploaded_at).toLocaleString()}

SUMMARY & INCIDENT LOG:
Security breach detected at primary entrance corridor. Mechanical force applied to locking assembly.
Recovered shell casings: 9mm semi-automatic weapon (x2).
Getaway vehicle captured on CCTV: White SUV Fortuner exiting north service gate.
Witness Statement Recorded: Guard Thomas Miller noted suspect yelling "Don't move!".

EVIDENCE TAGS: ${evidence.tags.join(', ')}`
        );
      }
    }
  }, [evidence]);

  // Audio Canvas Waveform Renderer
  useEffect(() => {
    if ((evidence.file_type === 'audio' || evidence.file_category.toLowerCase().includes('audio')) && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 60;
        const width = canvas.width / bars;
        for (let i = 0; i < bars; i++) {
          const height = Math.sin(i * 0.2) * 20 + Math.random() * 25 + 10;
          const x = i * width;
          const y = (canvas.height - height) / 2;
          ctx.fillStyle = i % 2 === 0 ? '#06b6d4' : '#3b82f6';
          ctx.fillRect(x, y, width - 2, height);
        }
      }
    }
  }, [evidence, audioTime]);

  const handleRunSingleAIAnalysis = async () => {
    if (!evidence) return;
    setAnalyzingFile(true);
    try {
      const res = await aiService.analyzeEvidenceFile(evidence.id);
      if (res.success) {
        setAnalysis(res.analysis);
        setActiveSideTab('ai_analysis');
        if (onAnalysisComplete) onAnalysisComplete();
      }
    } catch (err) {
      console.error('Failed single AI analysis:', err);
    } finally {
      setAnalyzingFile(false);
    }
  };

  // Image Drag/Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Video Handlers
  const togglePlayVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Audio Handlers
  const togglePlayAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const isImage = evidence.file_type === 'image' || evidence.file_category.toLowerCase().includes('photo');
  const isVideo = evidence.file_type === 'video' || evidence.file_category.toLowerCase().includes('cctv') || evidence.file_category.toLowerCase().includes('video');
  const isAudio = evidence.file_type === 'audio' || evidence.file_category.toLowerCase().includes('audio') || evidence.file_category.toLowerCase().includes('witness');
  const isPdf = evidence.file_type === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white font-mono truncate max-w-md">{evidence.file_name}</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {evidence.file_category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {(evidence.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded by {evidence.uploaded_by || 'Investigator'} on {new Date(evidence.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle Buttons */}
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveSideTab('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeSideTab === 'preview' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Evidence Viewer</span>
              </button>
              <button
                onClick={() => setActiveSideTab('ai_analysis')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeSideTab === 'ai_analysis' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Insights</span>
              </button>
            </div>

            {/* AI Analyze Action */}
            <button
              onClick={handleRunSingleAIAnalysis}
              disabled={analyzingFile}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
            >
              {analyzingFile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span>{analyzingFile ? 'Analyzing...' : 'Analyze with AI'}</span>
            </button>

            {/* Direct Download */}
            <a
              href={evidence.file_path}
              download={evidence.file_name}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
              title="Download File"
            >
              <Download className="h-4 w-4" />
            </a>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Viewer Panel */}
          <div className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center overflow-hidden p-4">
            {/* 1. IMAGE VIEWER */}
            {isImage && (
              <div
                className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Floating Image Control Bar */}
                <div className="absolute top-4 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                    className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-400 px-1">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                  >
                    Reset
                  </button>
                  <div className="h-4 w-px bg-slate-800" />
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-w-full max-h-full flex items-center justify-center transition-transform duration-100 ease-out">
                  <img
                    src={evidence.file_path}
                    alt={evidence.file_name}
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
                    }}
                    className="max-h-[70vh] object-contain rounded-lg shadow-2xl transition-all"
                    onError={(e) => {
                      // Fallback image if local upload link not found
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200';
                    }}
                  />
                </div>
              </div>
            )}

            {/* 2. VIDEO PLAYER */}
            {isVideo && (
              <div className="w-full max-w-4xl h-full flex flex-col justify-center space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={evidence.file_path}
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) setDuration(videoRef.current.duration);
                    }}
                    onEnded={() => setIsPlaying(false)}
                    className="max-h-[60vh] w-full object-contain"
                    onError={(e) => {
                      console.warn('Video source error:', e);
                    }}
                  />
                </div>

                {/* Video Custom Controller Bar */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCurrentTime(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={togglePlayVideo}
                        className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold"
                      >
                        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) videoRef.current.muted = !isMuted;
                        }}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
                      <span>Speed:</span>
                      {[0.5, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            playbackSpeed === spd ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AUDIO WAVEFORM PLAYER */}
            {isAudio && (
              <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl text-center">
                <audio
                  ref={audioRef}
                  src={evidence.file_path}
                  onTimeUpdate={() => {
                    if (audioRef.current) setAudioTime(audioRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current) setAudioDuration(audioRef.current.duration);
                  }}
                  onEnded={() => setAudioPlaying(false)}
                  className="hidden"
                />

                <div className="space-y-1">
                  <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
                    Witness Audio Waveform Player
                  </span>
                  <h4 className="text-base font-bold text-white">{evidence.file_name}</h4>
                </div>

                {/* Canvas Audio Waveform */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-center">
                  <canvas ref={canvasRef} width={480} height={80} className="w-full h-20" />
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 100}
                    value={audioTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setAudioTime(val);
                      if (audioRef.current) audioRef.current.currentTime = val;
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>{formatTime(audioTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={togglePlayAudio}
                    className="p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transform transition active:scale-95"
                  >
                    {audioPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* 4. PDF DOCUMENT VIEWER */}
            {isPdf && (
              <div className="w-full h-full flex flex-col space-y-3">
                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search PDF document text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 text-xs text-white px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 w-64"
                    />
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">Built-in PDF Renderer</span>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <iframe
                    src={evidence.file_path}
                    title={evidence.file_name}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* 5. TEXT / DOC / CHAT EXPORT / LOCATION FILE VIEWER */}
            {!isImage && !isVideo && !isAudio && !isPdf && (
              <div className="w-full h-full flex flex-col space-y-3 p-2">
                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search document text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 text-xs text-white px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 w-64"
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {evidence.file_category} Document Viewer
                  </span>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                    <h4 className="text-cyan-400 font-bold uppercase tracking-wider mb-2">Evidence Metadata Header</h4>
                    <p>File Name: {evidence.file_name}</p>
                    <p>File Category: {evidence.file_category}</p>
                    <p>File Size: {(evidence.file_size / 1024).toFixed(2)} KB</p>
                    <p>Upload Date: {new Date(evidence.uploaded_at).toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
                    {documentText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Drawer: AI Analysis & Intelligence Summary */}
          {activeSideTab === 'ai_analysis' && (
            <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    AI Analysis Result
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Cached DB
                </span>
              </div>

              {loadingAnalysis ? (
                <div className="py-12 text-center text-cyan-400 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold">Fetching stored AI Analysis...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4 text-xs">
                  {/* Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h5 className="text-[11px] font-mono font-bold text-cyan-400 uppercase">Executive Summary</h5>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {analysis.summary || analysis.description || analysis.witness_summary || JSON.stringify(analysis, null, 2)}
                    </p>
                  </div>

                  {/* Detected Entities / Objects */}
                  {(analysis.detected_objects || analysis.detected_entities || analysis.extracted_entities) && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h5 className="text-[11px] font-mono font-bold text-amber-400 uppercase">Extracted Forensic Entities</h5>
                      <div className="space-y-1.5">
                        {Object.entries(analysis.detected_objects || analysis.detected_entities || analysis.extracted_entities).map(
                          ([key, value]: [string, any], idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">{key.replace('_', ' ')}:</span>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(value) ? (
                                  value.map((v, i) => (
                                    <span key={i} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                                      {typeof v === 'object' ? JSON.stringify(v) : v}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-300 font-mono">{JSON.stringify(value)}</span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  {analysis.timestamps && analysis.timestamps.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h5 className="text-[11px] font-mono font-bold text-indigo-400 uppercase">Timestamp Key Frames</h5>
                      <div className="space-y-2">
                        {analysis.timestamps.map((ts: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/60 font-mono text-[11px]">
                            <span className="text-cyan-400 font-bold">{ts.time}</span> - {ts.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transcript if audio */}
                  {analysis.transcript && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h5 className="text-[11px] font-mono font-bold text-emerald-400 uppercase">Audio Speech Transcript</h5>
                      <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                        {analysis.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <Bot className="h-8 w-8 text-cyan-400 mx-auto" />
                  <div>
                    <h5 className="text-xs font-bold text-white">No AI Analysis Generated Yet</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click below to analyze this evidence file with CrimeLens AI Agents.
                    </p>
                  </div>
                  <button
                    onClick={handleRunSingleAIAnalysis}
                    disabled={analyzingFile}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    {analyzingFile ? 'Analyzing File...' : 'Analyze with AI'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
