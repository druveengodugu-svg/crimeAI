import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
      <div className="h-4 bg-slate-800 rounded w-1/3"></div>
      <div className="h-6 bg-slate-800 rounded w-2/3"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-800/80 rounded w-full"></div>
        <div className="h-3 bg-slate-800/80 rounded w-4/5"></div>
      </div>
      <div className="flex justify-between items-center pt-3">
        <div className="h-5 bg-slate-800 rounded w-16"></div>
        <div className="h-5 bg-slate-800 rounded w-24"></div>
      </div>
    </div>
  );
};

export const SkeletonList: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 animate-pulse flex items-center justify-between">
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
          </div>
          <div className="h-8 bg-slate-800 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
};
