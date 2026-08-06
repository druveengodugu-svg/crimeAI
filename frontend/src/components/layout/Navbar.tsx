import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Shield, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Left Toggle & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 w-64 md:w-80">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases, suspects, files..."
            onClick={() => navigate('/cases')}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>SYSTEM ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span>{currentDate}</span>
        </div>

        {/* Quick New Investigation Button */}
        <button
          onClick={() => navigate('/investigation/new')}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs px-3 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Case</span>
        </button>

        <button className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center space-x-2">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="h-8 w-8 rounded-full object-cover border border-cyan-500/40 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              <Shield className="h-4 w-4 text-cyan-400" />
            </div>
          )}
          <span className="text-xs font-medium text-slate-300 hidden md:inline">{user?.badge_number || 'INV-9042'}</span>
        </div>
      </div>
    </header>
  );
};
