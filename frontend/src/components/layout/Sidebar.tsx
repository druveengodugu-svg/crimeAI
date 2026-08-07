import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderPlus, 
  FolderSearch, 
  Bot, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Activity,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../services/api';
import { soundFx } from '../../utils/soundEffects';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    soundFx.playClick();
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Investigation', path: '/investigation/new', icon: FolderPlus },
    { label: 'Case History', path: '/cases', icon: FolderSearch },
    { label: 'AI Chat Copilot', path: '/chat', icon: Bot },
    { label: 'Investigator Profile', path: '/profile', icon: UserIcon }
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'IN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 glass-panel border-r border-slate-800/80 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Header Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => {
                soundFx.playClick();
                navigate('/dashboard');
              }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all">
                <ShieldAlert className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight text-white flex items-center gap-1.5 font-space">
                  CrimeLens <span className="text-cyan-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40">AI</span>
                </h1>
                <p className="text-[9px] text-cyan-400/90 font-mono tracking-widest uppercase flex items-center gap-1">
                  <Activity className="h-2.5 w-2.5 animate-pulse text-cyan-400" /> Digital Forensics
                </p>
              </div>
            </div>
          </div>

          {/* Quick AI Swarm Status Banner */}
          <div className="mx-3.5 mt-4 p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/30 flex items-center space-x-2.5 shadow-inner group cursor-pointer hover:border-cyan-500/60 transition-colors"
               onClick={() => {
                 soundFx.playClick();
                 navigate('/chat');
               }}
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1">
                <span>8 AI Agents Active</span>
                <Cpu className="h-3 w-3 text-cyan-400 inline" />
              </p>
              <p className="text-[9px] text-slate-400 font-mono truncate">Multimodal Evidence Swarm</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 mt-5 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    soundFx.playClick();
                    setMobileOpen(false);
                  }}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'}
                  `}
                >
                  <div className="flex items-center space-x-3 z-10">
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0 text-cyan-400 z-10" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-md hover:border-cyan-500/30 transition-all">
            <div className="flex items-center space-x-3 min-w-0">
              {user?.avatar_url ? (
                <img
                  src={getFileUrl(user.avatar_url)}
                  alt={user.full_name}
                  className="h-9 w-9 rounded-full object-cover border-2 border-cyan-500/50 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-500/50 text-cyan-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0 font-mono">
                  {getInitials(user?.full_name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate font-mono">{user?.full_name || 'Investigator'}</p>
                <p className="text-[10px] text-cyan-400/90 truncate font-mono">{user?.email || 'agent@crimelens.ai'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
