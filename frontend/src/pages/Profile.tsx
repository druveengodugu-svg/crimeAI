import React, { useEffect, useState, useRef } from 'react';
import { 
  User as UserIcon, 
  ShieldAlert, 
  FolderSearch, 
  FileCheck, 
  Award, 
  Calendar, 
  BadgeCheck, 
  Lock, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Edit2,
  Save,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const PRESET_AVATARS = [
  { id: '1', name: 'Agent Vance', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Det. Miller', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Insp. Chen', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Analyst Kowalski', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: '5', name: 'Capt. Rodriguez', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { id: '6', name: 'Cmdr. Hayes', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' }
];

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

export const Profile: React.FC = () => {
  const { user: authUser, updateUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(authUser?.full_name || '');
  const [badgeNumber, setBadgeNumber] = useState(authUser?.badge_number || '');
  const [department, setDepartment] = useState(authUser?.department || '');
  const [role, setRole] = useState(authUser?.role || 'Lead Investigator');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        if (res.user) {
          setProfile(res.user);
          setFullName(res.user.full_name || '');
          setBadgeNumber(res.user.badge_number || '');
          setDepartment(res.user.department || '');
          setRole(res.user.role || 'Lead Investigator');
        }
      } catch (err) {
        console.warn('Profile fetch error:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file (PNG, JPG, WEBP).', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const res = await authService.uploadAvatar(file);
      if (res.success && res.avatar_url) {
        setProfile((prev: any) => ({ ...prev, avatar_url: res.avatar_url }));
        updateUser({ avatar_url: res.avatar_url });
        setMessage({ text: 'Profile picture uploaded successfully!', type: 'success' });
      } else {
        setMessage({ text: res.error || 'Failed to upload profile picture.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Upload error occurred.', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPresetAvatar = async (url: string) => {
    setUploading(true);
    setMessage(null);

    try {
      const res = await authService.updateProfile({ avatar_url: url });
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, avatar_url: url }));
        updateUser({ avatar_url: url });
        setMessage({ text: 'Avatar selected successfully!', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to set avatar.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await authService.updateProfile({
        full_name: fullName,
        badge_number: badgeNumber,
        department: department,
        role: role
      });

      if (res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
        setIsEditing(false);
        setMessage({ text: 'Profile details saved successfully!', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to save profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'INV';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <UserIcon className="h-3.5 w-3.5" />
            <span>Investigator Credentials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Officer Profile & Avatar</h1>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isEditing 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          <span>{isEditing ? 'Cancel Editing' : 'Edit Credentials'}</span>
        </button>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          message.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/60 border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center space-x-2.5">
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-8 shadow-xl relative overflow-hidden">
        
        {/* Profile Picture Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center space-x-5">
            {/* Avatar container with photo upload overlay */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 transition-all group-hover:opacity-80"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-400 text-slate-950 font-black flex items-center justify-center text-2xl shadow-xl shadow-cyan-500/20">
                  {getInitials(profile?.full_name)}
                </div>
              )}

              {/* Upload Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-cyan-400" />
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Upload</span>
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                {profile?.full_name || 'Chief Investigator'}
                <BadgeCheck className="h-5 w-5 text-cyan-400" />
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{profile?.email || 'agent@crimelens.ai'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-md font-bold">
                  Badge: {profile?.badge_number || 'INV-9042'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {profile?.role || 'Lead Investigator'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Custom Photo</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form (When Active) */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              <span>Update Officer Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">Badge Number</label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">Police Rank / Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  {POLICE_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Preset Avatars Gallery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Select Preset Investigator Avatar</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Click to equip</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = profile?.avatar_url === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(avatar.url)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center space-y-2 relative group ${
                    isSelected 
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-medium text-slate-300 truncate w-full text-center">{avatar.name}</span>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 bg-cyan-400 rounded-full flex items-center justify-center text-slate-950">
                      <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Analytics Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-medium uppercase">Cases Created</span>
              <FolderSearch className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{profile?.cases_created || 1}</div>
            <p className="text-[11px] text-slate-500">Active crime dossiers</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-medium uppercase">Files Uploaded</span>
              <FileCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{profile?.files_uploaded || 4}</div>
            <p className="text-[11px] text-slate-500">Multimodal evidence files</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-medium uppercase">Completed</span>
              <Award className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{profile?.investigations_completed || 1}</div>
            <p className="text-[11px] text-slate-500">Full 8-Agent reports</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>JWT Encryption Active • Server-side Gemini API key isolation</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold text-[11px]">Protected Session</span>
        </div>
      </div>
    </div>
  );
};

