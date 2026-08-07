import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Shield, Search, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getFileUrl } from '../../services/api';
import { soundFx } from '../../utils/soundEffects';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 glass-panel sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/80">
      {/* Mobile Left Toggle & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            soundFx.playClick();
            setMobileOpen(true);
          }}
          className="p-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-slate-800/80"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 focus-within:border-cyan-500/50 rounded-xl px-3 py-1.5 w-64 md:w-80 transition-all shadow-inner">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Search cases, suspects, evidence..."
            onClick={() => {
              soundFx.playClick();
              navigate('/cases');
            }}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full cursor-pointer font-mono"
            readOnly
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono shadow-sm">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-cyan-400 font-bold tracking-wider">MULTIMODAL COPILOT</span>
          <span className="text-slate-700">|</span>
          <span>{currentDate}</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            toggleTheme();
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-800/80 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        {/* Quick New Investigation Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            navigate('/investigation/new');
          }}
          className="btn-cyber-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span className="hidden sm:inline font-mono uppercase tracking-wider">New Case</span>
        </button>

        <button 
          onClick={() => soundFx.playClick()}
          className="p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-800/80 relative transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center space-x-2">
          {user?.avatar_url ? (
            <img
              src={getFileUrl(user.avatar_url)}
              alt={user.full_name}
              className="h-8 w-8 rounded-full object-cover border-2 border-cyan-500/50 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-slate-200">
              <Shield className="h-4 w-4 text-cyan-400" />
            </div>
          )}
          <span className="text-xs font-mono font-bold text-slate-300 hidden md:inline">{user?.badge_number || 'INV-9042'}</span>
        </div>
      </div>
    </header>
  );
};
