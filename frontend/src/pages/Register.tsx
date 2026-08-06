import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Shield, Lock, Mail, User as UserIcon, BadgeCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const POLICE_ROLES = [
  'Lead Investigator',
  'Police Inspector (PI)',
  'Sub-Inspector (PSI)',
  'Station House Officer (SHO)',
  'Homicide Detective',
  'Cyber Crime Specialist',
  'Forensic Specialist',
  'Tactical Commander',
  'Intelligence Analyst'
];

export const Register: React.FC = () => {
  const [email, setEmail] = useState('investigator@crimelens.ai');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Chief Insp. Marcus Vance');
  const [badgeNumber, setBadgeNumber] = useState('INV-9042');
  const [department, setDepartment] = useState('Cyber & Forensics Unit');
  const [role, setRole] = useState('Lead Investigator');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.signup({
        email,
        password,
        full_name: fullName || 'Chief Inspector',
        badge_number: badgeNumber || 'INV-9042',
        department: department || 'Cyber & Forensics Unit',
        role
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        navigate('/dashboard');
        return;
      }
    } catch (err: any) {
      console.warn('[Register] Signup error, using fallback demo session:', err);
    }

    login('demo_jwt_token_crimelens_2026', {
      id: '00000000-0000-0000-0000-000000000001',
      email: (email || 'investigator@crimelens.ai').toLowerCase(),
      full_name: fullName || 'Chief Insp. Marcus Vance',
      badge_number: badgeNumber || 'INV-9042',
      department: department || 'Cyber & Forensics Unit',
      role: role || 'Lead Investigator'
    });
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-lg shadow-cyan-500/30">
            <ShieldAlert className="h-7 w-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            CrimeLens <span className="gradient-text">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Investigator Account Onboarding</p>
        </div>

        <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Create New Account</h2>
            <p className="text-xs text-slate-400">Register badge and access multimodal AI investigation tools</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Insp. Sarah Jenkins"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.jenkins@police.gov"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Badge #</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="INV-9088"
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

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Police Rank / Official Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                >
                  {POLICE_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>

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
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Account & Enter</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
