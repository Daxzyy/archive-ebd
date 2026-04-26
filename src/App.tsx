import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Lock, LogOut, PlusCircle, Search, X, Calendar,
  ChevronRight, Tag, User, Image as ImageIcon, FileText,
  CheckCircle, ArrowLeft, Loader2, Upload, ExternalLink, Info,
  AlertCircle, ArrowRight,
} from 'lucide-react';

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

function ArchiveModal({ archive, onClose, profiles }: { archive: Archive | null; onClose: () => void; profiles: Profile[] }) {
  if (!archive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-card rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full md:hidden"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full md:w-2/3 bg-black flex items-center justify-center overflow-hidden relative group">
            <img
              src={archive.image_url}
              alt={archive.description}
              className="max-w-full max-h-[50vh] md:max-h-[90vh] object-contain transition-transform duration-700"
            />
            <a
              href={archive.image_url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 p-3 bg-accent/20 hover:bg-accent/40 text-accent rounded-xl backdrop-blur-md border border-accent/20 transition-all opacity-0 group-hover:opacity-100"
              title="Open full image"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          <div className="w-full md:w-1/3 p-6 md:p-8 overflow-y-auto bg-card border-l border-border">
            <button
              onClick={onClose}
              className="hidden md:flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 group"
            >
              <X className="w-5 h-5 bg-border rounded-full p-1 group-hover:bg-accent group-hover:text-white transition-all shadow-lg" />
              <span className="text-xs uppercase font-bold tracking-widest mono-text">Close Viewer</span>
            </button>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] mono-text">Metadata</span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-snug">
                  {archive.description || 'No description provided for this archive.'}
                </h2>
              </div>

              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-border p-2.5 rounded-xl">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1 mono-text">Capture Date</p>
                    <p className="text-gray-200 font-medium font-sans">
                      {formatDate(archive.date, archive.date_unknown)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-border p-2.5 rounded-xl">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1 mono-text">Source</p>
                    <p className="text-gray-200 font-medium font-sans">{archive.source || 'Unknown'}</p>
                  </div>
                </div>
               <div className="flex items-start gap-4">
  <div className="bg-border p-2.5 rounded-xl">
    <User className="w-5 h-5 text-accent" />
  </div>
  <div>
    <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1 mono-text">Uploaded by</p>
    <p className="text-gray-200 font-medium font-sans">
      {profiles.find(p => p.id === archive?.uploaded_by)?.display_name || 'Unknown'}
    </p>
  </div>
</div>
                <div className="flex items-start gap-4">
                  <div className="bg-border p-2.5 rounded-xl">
                    <Tag className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1 mono-text">Categories</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {archive.tags?.length > 0 ? (
                        archive.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-border text-gray-300 rounded-lg text-[10px] font-bold uppercase tracking-wider mono-text border border-white/5">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px] italic mono-text">Untagged</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border mt-8">
                <div className="bg-accent-soft p-4 rounded-2xl border border-accent/10">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1 mono-text">System ID</p>
                  <p className="text-[10px] text-muted mono-text break-all opacity-60">
                    {archive.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('Email atau password salah.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        navigate('/');
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

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

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
          <h1 className="text-base font-bold text-white/90 tracking-tight mb-1">
            Eberardos <span className="text-white/25 font-normal">/</span>{' '}
            <span className="text-white/45 font-medium">archive</span>
          </h1>
          <p className="text-[12px] text-white/30">Masuk untuk mengakses arsip</p>
        </div>

        <form onSubmit={handleLogin} style={{ animation: shake ? 'shake 0.5s ease' : undefined }} className="flex flex-col gap-3">
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            placeholder="Email"
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

  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dateUnknown, setDateUnknown] = useState(false);
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');

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
          <span className="text-sm font-bold text-white/90 tracking-tight">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">new archive</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 mono-text hidden sm:block">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/25 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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
              <div>
                <label className={labelClass}>Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className={inputClass}
                />
              </div>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden border border-white/[0.07] bg-black aspect-video">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={() => setError('Image failed to load')}
                  />
                </div>
              )}
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

      <footer className="border-t border-white/[0.05] py-5 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20">© 2026 Eberardos Community</p>
        </div>
      </footer>
    </div>
  );
}

function ArchiveCard({ archive, onClick }: { archive: Archive; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden rounded-xl"
    >
      <div className="relative h-36 bg-white/5 overflow-hidden flex-shrink-0">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
        <img
          src={archive.image_url}
          alt={archive.description}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {archive.tags?.length > 0 && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] font-bold text-red-400 uppercase tracking-widest border border-red-400/20 rounded">
            {archive.tags[0]}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-[13px] text-white/75 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {archive.description || 'Untitled'}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-red-400 flex-shrink-0" />
            <span className="text-[10px] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatDate(archive.date, archive.date_unknown)}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
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
      const { data, error } = await supabase
        .from('archives')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setArchives(data || []);
      const tags = new Set<string>();
      const years = new Set<string>();
      data?.forEach((a: Archive) => {
        a.tags?.forEach((t: string) => tags.add(t));
        if (a.date) years.add(new Date(a.date).getFullYear().toString());
      });
      setAllTags(Array.from(tags).sort());
      setAllYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
      const { data: profileData } = await supabase.from('profiles').select('*');
      setProfiles(profileData || []);
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
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between" style={{ height: 52 }}>
          <span className="text-sm font-bold text-white/90 tracking-tight">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">archive</span>
          </span>
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all text-[11px] font-bold text-white/40 hover:text-white tracking-wider"
                >
                  <PlusCircle className="w-3 h-3" /> New
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/25 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
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

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-semibold text-white/40">
                {hasFilters ? 'Filtered' : 'Recent'}
              </span>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setSelectedTag('All'); setSelectedYear('All'); }}
                  className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  × clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex md:hidden relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-32 bg-white/[0.03] border border-white/[0.07] pl-7 pr-3 py-1.5 text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all rounded-lg"
                />
              </div>
              <span className="text-[11px] text-white/20 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {loading ? '—' : `${filtered.length} items`}
              </span>
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3"
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

      <footer className="border-t border-white/[0.05] py-5 mt-4">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <ArchiveModal archive={selectedArchive} onClose={() => setSelectedArchive(null)} profiles={profiles} />
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
        <Route path="/admin" element={session ? <Admin session={session} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
