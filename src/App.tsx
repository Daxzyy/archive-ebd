import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Lock, LogOut, PlusCircle, Search, X, Calendar,
  ChevronRight, Tag, User, Image as ImageIcon, FileText,
  CheckCircle, ArrowLeft, Loader2, Upload, ExternalLink, Info,
  AlertCircle, ArrowRight, Archive as ArchiveIcon, Hash,
} from 'lucide-react';
import ImageUpload from './ImageUpload';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables (Secrets).'
    );
  }
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export type Archive = {
  id: string;
  image_url: string;
  description: string;
  date: string | null;
  date_unknown: boolean;
  tags: string[];
  source: string;
  uploaded_by: string | null;
  created_at: string;
  slug: string;
};

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

function formatDate(dateStr: string | null, unknown: boolean): string {
  if (unknown || !dateStr) return 'Unknown';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

function generateSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── REDESIGNED MODAL — Split Layout ─────────────────────────────────────────
function ArchiveModal({ archive, onClose, profiles }: { archive: Archive | null; onClose: () => void; profiles: Profile[] }) {
  if (!archive) return null;

  const uploader = profiles.find(p => p.id === archive.uploaded_by)?.display_name || 'Unknown';

  return (
    <AnimatePresence>
      {archive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal — split layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="relative w-full max-w-3xl mx-auto bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
style={{ maxHeight: '88vh', height: '88vh' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 rounded-full transition-all"
            >
              <X className="w-3 h-3 text-white/60" />
            </button>

            {/* LEFT — Image panel */}
            <div className="relative bg-black flex-shrink-0 sm:w-[55%] overflow-hidden flex items-center justify-center"
  style={{ minHeight: 220, maxHeight: '88vh' }}>
              <img
                src={archive.image_url}
                alt={archive.description}
                className="w-full h-full object-contain"
                style={{ maxHeight: '88vh' }}
              />
              {/* Tags overlay */}
              {archive.tags?.length > 0 && (
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  {archive.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-red-400 uppercase tracking-widest rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Full image link */}
              
                <a href={archive.image_url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Full
              </a>
            </div>

            {/* RIGHT — Info panel */}
            <div className="flex-1 flex flex-col overflow-y-auto px-5 py-5 gap-5 min-w-0" style={{ maxHeight: '50vh' }}>
              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Deskripsi</p>
                <p className="text-white/85 text-[14px] font-semibold leading-snug">
                  {archive.description || 'No description provided.'}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.07]" />

              {/* Metadata — vertical list */}
              <div className="flex flex-col gap-3">
                <MetaRow icon={<Calendar className="w-3.5 h-3.5 text-red-400" />} label="Tanggal" value={formatDate(archive.date, archive.date_unknown)} />
                <MetaRow icon={<User className="w-3.5 h-3.5 text-red-400" />} label="Source" value={archive.source || 'Unknown'} />
                <MetaRow icon={<Hash className="w-3.5 h-3.5 text-red-400" />} label="Tags" value={archive.tags?.length > 0 ? archive.tags.join(', ') : 'Untagged'} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Upload by</span>
                  </div>
                  <Link
                    to={uploader !== 'Unknown' ? `/@${uploader}` : '#'}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="text-[12px] text-red-400/80 hover:text-red-400 font-medium underline decoration-dotted underline-offset-2 transition-colors"
                  >
                    {uploader}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {icon}
        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[12px] text-white/65 font-medium leading-tight text-right">{value}</p>
    </div>
  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[12px] text-white/70 font-medium leading-tight">{value}</p>
    </div>
  );
}
function Sidebar({ session, profiles, onClose, onNavigate, onLogout, currentPath }: {
  session: Session;
  profiles: Profile[];
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  currentPath: string;
}) {
  const profile = profiles.find(p => p.id === session.user.id);
  const displayName = profile?.display_name || session.user.email?.split('@')[0] || 'Admin';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-64 h-full bg-[#161616] border-l border-white/[0.08] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-end px-4 py-3 border-b border-white/[0.06]">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[13px] font-semibold text-white/60 mb-1 px-3">Dashboard</p>
            <button
              onClick={() => { onNavigate('/'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium text-left group ${
                currentPath === '/' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArchiveIcon className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                Home
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
            </button>
            <button
              onClick={() => { onNavigate('/admin'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium text-left group ${
                currentPath === '/admin' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                New Archive
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
            </button>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white/60 mb-1 px-3">Account</p>
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-red-400/20 border border-red-400/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[12px] font-bold text-red-400 uppercase">{displayName[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/70 truncate">{displayName}</p>
                <p className="text-[10px] text-white/25 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { onNavigate('/profile'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium text-left group ${
                currentPath === '/profile' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                Profil
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
            </button>
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all text-[13px] font-medium text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Logout
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-red-400/40 transition-colors" />
            </button>
          </div>
        </nav>
      </motion.div>
    </div>
  );
}

function ProfilePage({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
const [_unused] = useState(false)
const [initialName, setInitialName] = useState('');
const [initialAvatar, setInitialAvatar] = useState('');
const [bio, setBio] = useState('');
const [initialBio, setInitialBio] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setDisplayName(data.display_name || '');
          setAvatarUrl(data.avatar_url || '');
          setBio(data.bio || '');
          setInitialName(data.display_name || '');
          setInitialAvatar(data.avatar_url || '');
          setInitialBio(data.bio || '');
        }
        setJoinedAt(new Date(session.user.created_at).toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric',
        }));
      const { data: profileData } = await supabase.from('profiles').select('*');
      setProfiles(profileData || []);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName === initialName && avatarUrl === initialAvatar && bio === initialBio) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, display_name: displayName, avatar_url: avatarUrl || null, bio: bio || null });
      if (dbError) throw dbError;
      setSuccess(true);
      setInitialName(displayName);
      setInitialAvatar(avatarUrl);
      setInitialBio(bio);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-2.5 px-3.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all";
  const labelClass = "block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen bg-[#131313] text-neutral-200" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <h1 className="text-sm font-bold text-white/90 tracking-tight pixel-text">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">profile</span>
          </h1>
          <span />
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white transition-colors mb-6 text-[11px] font-bold uppercase tracking-wider group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                <div className="w-20 h-20 rounded-full bg-red-400/20 border-2 border-red-400/30 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setAvatarUrl('')} />
                  ) : (
                    <span className="text-3xl font-bold text-red-400 uppercase">{displayName?.[0] || '?'}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-white/0 group-hover:text-white/80 transition-all" />
                  <span className="text-[9px] font-bold text-white/0 group-hover:text-white/60 transition-all uppercase tracking-widest">Ganti foto</span>
                </div>
                <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  try {
                    const res = await fetch('https://uploadgh.zone.id/uploadfile', { method: 'POST', body: form });
                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const url = doc.querySelector('#rawUrlLink')?.getAttribute('href');
                    if (url) setAvatarUrl(url);
                  } catch { setError('Upload gagal'); }
                  e.target.value = '';
                }} />
              </div>
              <div className="text-center">
                <p className="text-white/80 font-semibold text-sm">{displayName || 'No name set'}</p>
                <p className="text-white/30 text-[11px]">{session.user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Edit Profil</span>
                </div>
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input
                    type="text"
                    placeholder="nama kamu"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea
                    rows={2}
                    placeholder="isi bio lu disini..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Info Akun</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest font-bold">Email</span>
                    <span className="text-[12px] text-white/60">{session.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest font-bold">Bergabung</span>
                    <span className="text-[12px] text-white/60">{joinedAt}</span>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3.5 border border-red-500/20 bg-red-500/5 rounded-xl text-red-400 text-[12px]"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3.5 border border-green-500/20 bg-green-500/5 rounded-xl text-green-400 text-[12px]"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Profil berhasil disimpan!
                </motion.div>
              )}

              <button
                type="submit"
                disabled={saving || (displayName === initialName && avatarUrl === initialAvatar && bio === initialBio)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-[0.99] text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin opacity-60" /> : 'Simpan Perubahan'}
              </button>
            </form>
          </>
        )}
      </div>

<footer className="border-t border-white/[0.05] py-5 mt-8 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <TabBar session={session} profiles={profiles} currentPath="/profile" />
    </div>
  );
}
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();

      let loginEmail = email;

      // Kalau input bukan email (ga ada @), lookup dulu ke tabel profiles
      if (!email.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('display_name', email)
          .single();

        if (profileError || !profileData?.email) {
          setError('Username tidak ditemukan.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setLoading(false);
          return;
        }

        loginEmail = profileData.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        setError('Email/username atau password salah.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        const params = new URLSearchParams(window.location.search);
        navigate(params.get('next') || '/');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#131313] flex items-center justify-center px-4"
      style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>

      <div className="fixed inset-0 bg-[#131313] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs relative"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 border border-white/10 bg-white/[0.04] rounded-xl mb-5">
            <Lock style={{ width: 18, height: 18 }} className="text-red-400" />
          </div>
          <h1 className="text-sm font-bold text-white/90 tracking-tight mb-1">
            Eberardos <span className="text-white/25 font-normal">/</span>{' '}
            <span className="text-white/45 font-medium">archive</span>
          </h1>
          <p className="text-[12px] text-white/30">Masuk untuk mengakses arsip</p>
        </div>

        <form onSubmit={handleLogin} style={{ animation: shake ? 'shake 0.5s ease' : undefined }} className="flex flex-col gap-3">
          <input
            type="text"
autoFocus
required
value={email}
onChange={e => { setEmail(e.target.value); setError(null); }}
placeholder="Email atau Username"
autoComplete="off"
autoCapitalize="off"
spellCheck={false}
            className={`w-full bg-white/[0.04] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all ${
              error ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/25'
            }`}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              placeholder="Password"
              className={`w-full bg-white/[0.04] border rounded-xl py-3 px-4 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all ${
                error ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-sm mt-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Masuk
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 group-hover:text-red-400 transition-all" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 Eberardos Community
        </p>
      </motion.div>
    </div>
  );
}

function Admin({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dateUnknown, setDateUnknown] = useState(false);
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    getSupabase().from('profiles').select('*').then(({ data }) => {
      setProfiles(data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      new URL(imageUrl);
    } catch {
      setError('Invalid image URL format.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase.from('archives').insert([{
        image_url: imageUrl,
        description,
        date: dateUnknown ? null : date || null,
        date_unknown: dateUnknown,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        source,
        uploaded_by: session.user.id,
        slug: generateSlug(),
      }]);

      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess(true);
        setImageUrl(''); setDescription(''); setDate('');
        setDateUnknown(false); setTags(''); setSource('');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    navigate('/login');
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-2.5 px-3.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all";
  const labelClass = "block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5";

  return (
    <div
      className="min-h-screen bg-[#131313] text-neutral-200"
      style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}
    >
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <h1 className="text-sm font-bold text-white/90 tracking-tight pixel-text">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">new archive</span>
          </h1>
          <span />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white transition-colors mb-6 text-[11px] font-bold uppercase tracking-wider group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="mb-7">
          <h1 className="text-lg font-bold text-white/90 tracking-tight mb-1">Add Archive</h1>
          <p className="text-[12px] text-white/30">Upload a new record to the Eberardos repository</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Media</span>
            </div>
            <div className="flex flex-col gap-4">
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </div>
          </div>

          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Date</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Capture Date</label>
                <input
                  type="date"
                  disabled={dateUnknown}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${dateUnknown ? 'bg-red-400 border-red-400' : 'border-white/20 group-hover:border-white/40'}`}>
                  {dateUnknown && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={dateUnknown} onChange={e => setDateUnknown(e.target.checked)} />
                <span className="text-[12px] text-white/35 group-hover:text-white/60 transition-colors">Date unknown</span>
              </label>
            </div>
          </div>

          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Details</span>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What's in this screenshot?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className={labelClass}>Source</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input
                    type="text"
                    placeholder="WhatsApp Group name"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Tags{' '}
                  <span className="text-white/15 normal-case tracking-normal font-normal">comma separated</span>
                </label>
                <input
                  type="text"
                  placeholder="funny, lore, random"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className={inputClass}
                />
                {tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.split(',').filter(t => t.trim()).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-400/10 text-red-400 border border-red-400/20 rounded text-[10px] font-bold uppercase tracking-wide">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 border border-red-500/20 bg-red-500/5 rounded-xl text-red-400 text-[12px]"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 border border-green-500/20 bg-green-500/5 rounded-xl text-green-400 text-[12px]"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Saved! Redirecting...
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-[0.99] group text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin opacity-60" />
            ) : success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <>
                <Upload className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
                Save to Archive
              </>
            )}
          </button>
        </form>
      </div>

<footer className="border-t border-white/[0.05] py-5 mt-8 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <TabBar session={session} profiles={profiles} currentPath="/admin" />
    </div>
  );
}

function TabBar({ session, profiles, currentPath }: { session: Session; profiles: Profile[]; currentPath: string }) {
  const navigate = useNavigate();
  const profile = profiles.find(p => p.id === session.user.id);
  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || '';

  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
    },
    {
      path: '/search',
      label: 'Search',
      icon: (_active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      ),
    },
    {
      path: '/admin',
      label: 'New',
      icon: (_active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (active: boolean) =>
        avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className={`w-6 h-6 rounded-full object-cover border-2 transition-all ${active ? 'border-red-400' : 'border-white/20'}`} />
        ) : (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all text-[10px] font-bold uppercase ${active ? 'border-red-400 bg-red-400/20 text-red-400' : 'border-white/20 bg-white/5 text-white/40'}`}>
            {displayName?.[0] || '?'}
          </div>
        ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#131313]/95 backdrop-blur-md border-t border-white/[0.07]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-md mx-auto flex items-stretch">
        {tabs.map(tab => {
          const active = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all ${active ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
            >
              {tab.icon(active)}
              <span className={`text-[9px] font-bold uppercase tracking-widest transition-all ${active ? 'text-red-400' : 'text-white/25'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArchiveCard({ archive, onClick }: { archive: Archive; onClick: () => void }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/${archive.slug}`)}
      className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden rounded-xl break-inside-avoid mb-3"
    >
      <div className="relative bg-white/5 overflow-hidden">
        {!loaded && <div className="w-full h-28 animate-pulse bg-white/5" />}
        <img
          src={archive.image_url}
          alt={archive.description}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-auto block transition-all duration-500 group-hover:scale-[1.02] ${loaded ? 'opacity-100' : 'opacity-0 h-0'}`}
        />
        {archive.tags?.length > 0 && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] font-bold text-red-400 uppercase tracking-widest border border-red-400/20 rounded">
            {archive.tags[0]}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <p className="text-[12px] text-white/70 font-medium leading-snug group-hover:text-white transition-colors">
          {archive.description || 'Untitled'}
        </p>
        <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-red-400 flex-shrink-0" />
            <span className="text-[10px] text-white/35" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatDate(archive.date, archive.date_unknown)}
            </span>
          </div>
          <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard({ session }: { session: Session | null }) {
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<string[]>([]);

  useEffect(() => { fetchArchives(); }, []);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const [{ data, error }, { data: profileData }] = await Promise.all([
        supabase.from('archives').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);
      if (error) throw error;
      setArchives(data || []);
      setProfiles(profileData || []);
      const tags = new Set<string>();
      const years = new Set<string>();
      data?.forEach((a: Archive) => {
        a.tags?.forEach((t: string) => tags.add(t));
        if (a.date) years.add(new Date(a.date).getFullYear().toString());
      });
      setAllTags(Array.from(tags).sort());
      setAllYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    navigate('/login');
  };

  const filtered = archives.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      a.description?.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q)) ||
      a.source?.toLowerCase().includes(q);
    const matchTag = selectedTag === 'All' || a.tags?.includes(selectedTag);
    const matchYear = selectedYear === 'All' || (a.date && new Date(a.date).getFullYear().toString() === selectedYear);
    return matchSearch && matchTag && matchYear;
  });

  const hasFilters = !!(search || selectedTag !== 'All' || selectedYear !== 'All');

  return (
    <div className="min-h-screen bg-[#131313] text-neutral-200" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <div className="fixed inset-0 bg-[#131313] -z-10 pointer-events-none" />

      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between" style={{ height: 52 }}>
          <h1 className="text-sm font-bold text-white/90 tracking-tight pixel-text">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">archive</span>
          </h1>
          <div className="flex items-center gap-2">
            {!session && (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[11px] font-bold text-white/35 hover:text-white tracking-wider"
              >
                <Lock className="w-3 h-3" /> Access
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-7">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-5 w-44 flex-shrink-0 pt-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.07] pl-8 pr-7 py-2 text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all rounded-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {allYears.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5 px-1">Year</p>
              <div className="flex flex-col">
                {['All', ...allYears].map(y => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`text-left px-2 py-1.5 text-[12px] font-medium transition-colors rounded-lg ${
                      selectedYear === y ? 'text-white bg-white/[0.07]' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5 px-1">Tags</p>
              <div className="flex flex-col">
                {['All', ...allTags].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`text-left px-2 py-1.5 text-[12px] font-medium transition-colors rounded-lg flex items-center justify-between ${
                      selectedTag === t ? 'text-white bg-white/[0.07]' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{t}</span>
                    {selectedTag === t && t !== 'All' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">

          {/* ── REVISED: Header row with count badge ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-semibold text-white/40">
                {hasFilters ? 'Filtered' : 'Recent'}
              </span>
              {/* Count badge — bright & clear */}
              {!loading && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/15 rounded-full text-[11px] font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {filtered.length}
                  <span className="text-white/40 font-normal text-[10px]">item{filtered.length !== 1 ? 's' : ''}</span>
                </span>
              )}
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setSelectedTag('All'); setSelectedYear('All'); }}
                  className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  × clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 border border-white/[0.06] bg-white/[0.02] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              className="columns-2 lg:columns-3 gap-3"
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(a => (
                  <ArchiveCard key={a.id} archive={a} onClick={() => setSelectedArchive(a)} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.07] rounded-xl">
              <p className="text-white/20 text-sm">No archives found</p>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setSelectedTag('All'); setSelectedYear('All'); }}
                  className="mt-2 text-[11px] text-red-400/50 hover:text-red-400 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-white/[0.05] py-5 mt-4 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <ArchiveModal archive={selectedArchive} onClose={() => setSelectedArchive(null)} profiles={profiles} />
      {session && <TabBar session={session} profiles={profiles} currentPath="/" />}
    </div>
  );
}

function MetaCellLink({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <Link
      to={href}
      onClick={(e) => e.stopPropagation()}
      className="bg-white/[0.03] border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06] rounded-xl p-3 flex flex-col gap-1.5 cursor-pointer transition-all group no-underline"
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[12px] text-red-400/80 group-hover:text-red-400 font-medium leading-tight underline decoration-dotted underline-offset-2">{value}</p>
    </Link>
  );
}

function useDynamicMeta(title: string, description: string, image?: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('og:title', title);
    setMeta('og:description', description);
    if (image) { setMeta('og:image', image); setMetaName('twitter:image', image); }
    setMetaName('twitter:card', 'summary');
  }, [title, description, image]);
}

function UserProfilePage({ profiles: _ignored, username: usernameProp }: { profiles: Profile[]; username?: string }) {
  const { username: usernameParam } = useParams<{ username: string }>();
  const username = usernameProp ?? usernameParam;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<(Profile & { bio?: string }) | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDynamicMeta(
    profile ? `@${profile.display_name} — Eberardos Archive` : 'Eberardos Archive',
    profile ? `${(profile as any).bio || 'Member Eberardos Community'} · ${archives.length} arsip diupload` : '',
    profile?.avatar_url || undefined,
  );

  useEffect(() => {
    if (!username) return;
    if (!username.startsWith('@')) { navigate('/', { replace: true }); return; }
    const doFetch = async () => {
      try {
        const supabase = getSupabase();
        const cleanUsername = username.slice(1);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('display_name', cleanUsername)
          .single();
        if (!profileData) { setNotFound(true); setLoading(false); return; }
        setProfile(profileData);
        const { data: archiveData } = await supabase
          .from('archives')
          .select('*')
          .eq('uploaded_by', profileData.id)
          .order('created_at', { ascending: false });
        setArchives(archiveData || []);
      } catch (e) {
        console.error('Profile fetch error:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center gap-4 px-4" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <div className="text-center">
        <p className="text-white/10 text-6xl font-bold mb-4">404</p>
        <p className="text-white/50 text-sm font-semibold">User <span className="text-red-400">{username}</span> tidak ditemukan</p>
        <p className="text-white/25 text-xs mt-1">Username mungkin salah atau belum terdaftar</p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-2 flex items-center gap-1.5 text-white/25 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#131313] text-neutral-200" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <div className="fixed inset-0 bg-[#131313] -z-10 pointer-events-none" />

      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <button onClick={() => navigate('/')} className="text-sm font-bold text-white/90 tracking-tight pixel-text hover:text-white transition-colors">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">@{username?.startsWith('@') ? username.slice(1) : username}</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[11px] font-bold text-white/35 hover:text-white tracking-wider"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.10]">
          <div className="w-[72px] h-[72px] rounded-full bg-red-400/20 border-2 border-red-400/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-red-400 uppercase">{(profile?.display_name || '?')[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="text-[15px] font-bold text-white/90 tracking-tight leading-tight">{profile?.display_name}</h1>
              <span className="text-[11px] text-white/35 font-medium tabular-nums">{archives.length} posts</span>
            </div>
            <p className="text-[12px] text-white/35 leading-tight mt-0.5">@{username?.startsWith('@') ? username.slice(1) : username}</p>
            {(profile as any)?.bio && <p className="text-[12px] text-white/70 leading-snug mt-1">{(profile as any).bio}</p>}
          </div>
        </div>

        <div className="mb-4">
          {archives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.07] rounded-xl">
              <p className="text-white/20 text-sm">Belum ada arsip</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {archives.map(a => (
                <div key={a.id} className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 flex flex-col overflow-hidden rounded-xl">
                  <div className="relative h-28 bg-white/5 overflow-hidden flex-shrink-0">
                    <img src={a.image_url} alt={a.description} loading="lazy" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04]" />
                    {a.tags?.length > 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] font-bold text-red-400 uppercase tracking-widest border border-red-400/20 rounded">
                        {a.tags[0]}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] text-white/65 font-medium leading-snug line-clamp-2">{a.description || 'Untitled'}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Calendar className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                      <span className="text-[9px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDate(a.date, a.date_unknown)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/[0.05] py-5 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>
    </div>
  );
}

function SearchPage({ session }: { session: Session }) {
  const [query, setQuery] = useState('');
  const [archives, setArchives] = useState<Archive[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const supabase = getSupabase();
      const [{ data }, { data: profileData }] = await Promise.all([
        supabase.from('archives').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);
      setArchives(data || []);
      setProfiles(profileData || []);
      const tags = new Set<string>();
      const years = new Set<string>();
      data?.forEach((a: Archive) => {
        a.tags?.forEach((t: string) => tags.add(t));
        if (a.date) years.add(new Date(a.date).getFullYear().toString());
      });
      setAllTags(Array.from(tags).sort());
      setAllYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
      setLoading(false);
    };
    fetchAll();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const filtered = archives.filter(a => {
    const q = query.toLowerCase();
    const matchSearch = !q ||
      a.description?.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q)) ||
      a.source?.toLowerCase().includes(q);
    const matchTag = selectedTag === 'All' || a.tags?.includes(selectedTag);
    const matchYear = selectedYear === 'All' || (a.date && new Date(a.date).getFullYear().toString() === selectedYear);
    return matchSearch && matchTag && matchYear;
  });

  const hasFilters = !!(query || selectedTag !== 'All' || selectedYear !== 'All');

  return (
    <div className="min-h-screen bg-[#131313] text-neutral-200" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <h1 className="text-sm font-bold text-white/90 tracking-tight pixel-text">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">search</span>
          </h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari arsip, tag, atau source..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-white/25 rounded-xl py-3 pl-10 pr-10 text-sm text-white/80 placeholder:text-white/25 focus:outline-none transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        {(allTags.length > 0 || allYears.length > 0) && (
          <div className="flex gap-2 flex-wrap mb-4">
            {allYears.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(selectedYear === y ? 'All' : y)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all ${
                  selectedYear === y ? 'bg-red-400/15 border-red-400/40 text-red-400' : 'bg-white/[0.03] border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20'
                }`}
              >{y}</button>
            ))}
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? 'All' : t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all ${
                  selectedTag === t ? 'bg-red-400/15 border-red-400/40 text-red-400' : 'bg-white/[0.03] border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20'
                }`}
              >{t}</button>
            ))}
          </div>
        )}

        {/* Result count */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-white/30">{hasFilters ? 'Hasil' : 'Semua'}</span>
          {!loading && (
            <span className="px-2 py-0.5 bg-white/10 border border-white/15 rounded-full text-[11px] font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {filtered.length} <span className="text-white/40 font-normal">items</span>
            </span>
          )}
          {hasFilters && (
            <button onClick={() => { setQuery(''); setSelectedTag('All'); setSelectedYear('All'); }} className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">× clear</button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-44 border border-white/[0.06] bg-white/[0.02] animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(a => (
              <ArchiveCard key={a.id} archive={a} onClick={() => setSelectedArchive(a)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.07] rounded-xl gap-2">
            <Search className="w-6 h-6 text-white/10" />
            <p className="text-white/20 text-sm">Ga ada hasil</p>
            {hasFilters && <button onClick={() => { setQuery(''); setSelectedTag('All'); setSelectedYear('All'); }} className="text-[11px] text-red-400/50 hover:text-red-400 transition-colors">Clear filter</button>}
          </div>
        )}
      </div>

      <footer className="border-t border-white/[0.05] py-5 mt-4 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <ArchiveModal archive={selectedArchive} onClose={() => setSelectedArchive(null)} profiles={profiles} />
      <TabBar session={session} profiles={profiles} currentPath="/search" />
    </div>
  );
}

function ArchiveDetailPage({ session }: { session: Session | null }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [archive, setArchive] = useState<Archive | null>(null);
  const [uploader, setUploader] = useState<string>('Unknown');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useDynamicMeta(
    archive ? `${archive.description} — Eberardos Archive` : 'Eberardos Archive',
    archive ? `Diarsipkan ${formatDate(archive.date, archive.date_unknown)}` : '',
    archive?.image_url,
  );

  useEffect(() => {
    if (!slug) return;
    const doFetch = async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase.from('archives').select('*').eq('slug', slug).single();
        if (!data) { setNotFound(true); setLoading(false); return; }
        setArchive(data);
        if (data.uploaded_by) {
          const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', data.uploaded_by).single();
          setUploader(profile?.display_name || 'Unknown');
        }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    doFetch();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  );

  if (notFound || !archive) return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center gap-4 px-4" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <p className="text-white/10 text-6xl font-bold">404</p>
      <p className="text-white/50 text-sm font-semibold">Arsip tidak ditemukan</p>
      <button onClick={() => navigate('/')} className="mt-2 flex items-center gap-1.5 text-white/25 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group">
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Kembali
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#131313] text-neutral-200" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <button onClick={() => navigate('/')} className="text-sm font-bold text-white/90 tracking-tight pixel-text hover:text-white transition-colors">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">archive</span>
          </button>
          <span />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group w-fit"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div
          className="relative rounded-xl overflow-hidden bg-black border border-white/10 cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
        >
          <img src={archive.image_url} alt={archive.description} className="w-full max-h-[420px] object-contain block" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            <div className="opacity-0 group-hover:opacity-100 transition-all w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-white/80" />
            </div>
          </div>
        </div>

        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
            <img
              src={archive.image_url}
              alt={archive.description}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Deskripsi</p>
            <p className="text-white/85 text-[15px] font-semibold leading-snug">{archive.description || 'No description.'}</p>
          </div>
          <div className="border-t border-white/[0.07]" />
          <div className="flex flex-col gap-3">
            <MetaRow icon={<Calendar className="w-3.5 h-3.5 text-red-400" />} label="Tanggal" value={formatDate(archive.date, archive.date_unknown)} />
            <MetaRow icon={<User className="w-3.5 h-3.5 text-red-400" />} label="Source" value={archive.source || 'Unknown'} />
            <MetaRow icon={<Hash className="w-3.5 h-3.5 text-red-400" />} label="Tags" value={archive.tags?.length > 0 ? archive.tags.join(', ') : 'Untagged'} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Upload by</span>
              </div>
              <Link to={uploader !== 'Unknown' ? `/@${uploader}` : '#'} className="text-[12px] text-red-400/80 hover:text-red-400 font-medium underline decoration-dotted underline-offset-2 transition-colors">
                {uploader}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.05] py-5 mt-4 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20 text-center">© 2026 Eberardos Community</p>
        </div>
      </footer>

      {session && <TabBar session={session} profiles={[]} currentPath="" />}
    </div>
  );
}

function SlugOrUserRouter({ session }: { session: Session | null }) {
  const { slug } = useParams<{ slug: string }>();
  if (slug?.startsWith('@')) {
    return <UserProfilePage profiles={[]} username={slug} />;
  }
  return <ArchiveDetailPage session={session} />;
}

function LogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    getSupabase().auth.signOut().then(() => navigate('/login'));
  }, []);
  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setChecking(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Unknown configuration error');
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-card border border-accent/20 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="bg-accent-soft p-4 rounded-2xl w-fit mx-auto">
            <AlertTriangle className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white pixel-text tracking-tighter uppercase">Configuration Required</h1>
            <p className="text-muted text-sm mono-text leading-relaxed">
              Connect your Supabase project to use the Archive System.
            </p>
          </div>
          <div className="bg-bg/50 p-4 rounded-xl border border-border text-left">
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 mono-text">Missing Variables:</p>
            <ul className="text-[10px] text-muted space-y-1 mono-text list-disc ml-4">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
<Routes>
        <Route path="/" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/search" element={session ? <SearchPage session={session} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={session ? <Admin session={session} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={session ? <ProfilePage session={session} /> : <Navigate to="/login" />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/:slug" element={<SlugOrUserRouter session={session} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
