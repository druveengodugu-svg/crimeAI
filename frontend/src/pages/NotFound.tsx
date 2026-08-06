import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 – Dossier Route Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">The requested investigation page or dossier URL does not exist or has been restricted.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
