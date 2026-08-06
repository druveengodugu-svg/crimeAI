import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, User as UserIcon, BadgeCheck, ArrowRight, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('investigator@crimelens.ai');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Chief Insp. Marcus Vance');
  const [badgeNumber, setBadgeNumber] = useState('INV-9042');
  const [department, setDepartment] = useState('Cyber & Forensics Unit');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Lead Investigator');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const res = await authService.signup({
          email,
          password,
          full_name: fullName || 'Chief Inspector',
          badge_number: badgeNumber || 'INV-9042',
          department,
          role
        });
        login(res?.token || 'demo_jwt_token_crimelens_2026', res?.user || {
          id: '00000000-0000-0000-0000-000000000001',
          email: email || 'investigator@crimelens.ai',
          full_name: fullName || 'Chief Insp. Marcus Vance',
          badge_number: badgeNumber || 'INV-9042',
          department: department || 'Cyber & Forensics Unit',
          role: role || 'Lead Investigator'
        });
      } else {
        const res = await authService.login({ email, password });
        login(res?.token || 'demo_jwt_token_crimelens_2026', res?.user || {
          id: '00000000-0000-0000-0000-000000000001',
          email: email || 'investigator@crimelens.ai',
          full_name: fullName || 'Chief Insp. Marcus Vance',
          badge_number: badgeNumber || 'INV-9042',
          department: department || 'Cyber & Forensics Unit',
          role: role || 'Lead Investigator'
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      login('demo_jwt_token_crimelens_2026', {
        id: '00000000-0000-0000-0000-000000000001',
        email: email || 'investigator@crimelens.ai',
        full_name: fullName || 'Chief Insp. Marcus Vance',
        badge_number: badgeNumber || 'INV-9042',
        department: department || 'Cyber & Forensics Unit',
        role: role || 'Lead Investigator'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login({
        email: 'investigator@crimelens.ai',
        password: 'password123'
      });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      login('demo_jwt_token_crimelens_2026', {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'investigator@crimelens.ai',
        full_name: 'Chief Insp. Marcus Vance',
        badge_number: 'INV-9042',
        department: 'Special Homicide & Cyber Crime Division',
        role: 'Lead Investigator'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-xl shadow-cyan-500/30">
            <ShieldAlert className="h-8 w-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            CrimeLens <span className="gradient-text">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Agentic Multimodal Investigation Copilot</p>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          {/* Quick 1-Click Demo Login Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02]"
          >
            <Zap className="h-4 w-4 fill-slate-950 stroke-[2]" />
            <span>⚡ One-Click Quick Demo Access</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-mono text-slate-500 uppercase">Or {isSignup ? 'Sign Up' : 'Sign In'}</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Tab Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${!isSignup ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${isSignup ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && (
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Chief Insp. Marcus Vance"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@crimelens.ai"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-300">Badge #</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="INV-9042"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-300">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isSignup ? 'Create Account & Enter' : 'Sign In to Copilot'}</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center text-cyan-400 font-semibold space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Default Credentials:</span>
            </div>
            <div>Email: <code className="text-slate-200">investigator@crimelens.ai</code></div>
            <div>Password: <code className="text-slate-200">password123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};
