import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, Image, Film, Mic, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { caseService } from '../../services/caseService';

interface UploadEvidenceModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')) {
      return <Image className="h-4 w-4 text-cyan-400" />;
    }
    if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi') || name.endsWith('.mkv')) {
      return <Film className="h-4 w-4 text-indigo-400" />;
    }
    if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a') || name.endsWith('.ogg')) {
      return <Mic className="h-4 w-4 text-amber-400" />;
    }
    return <FileText className="h-4 w-4 text-emerald-400" />;
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one evidence file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await caseService.uploadEvidence(caseId, selectedFiles);
      setSelectedFiles([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload evidence error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload evidence files.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Upload Case Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3
              ${dragOver 
                ? 'border-cyan-400 bg-cyan-950/30 scale-[0.99]' 
                : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/80'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.mp4,.mov,.avi,.mkv,.mp3,.wav,.m4a,.ogg,.json,.csv,.gpx,.kml"
            />
            <div className="h-12 w-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <UploadCloud className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Click or drag & drop files here to upload</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Supports Images, Videos, Audio, PDFs, DOCX, FIR reports, Chat logs & Location files
              </p>
            </div>
          </div>

          {/* File Selection List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {getFileIcon(file)}
                      <span className="font-mono text-white truncate font-medium">{file.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={uploading || selectedFiles.length === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Storing in Evidence Repository...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                <span>Confirm Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
