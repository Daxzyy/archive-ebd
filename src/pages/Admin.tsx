import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon,
  Tag, User, CheckCircle, AlertTriangle, ArrowLeft, Loader2, PlusCircle
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { clearAuthenticated } from '../lib/auth';
import { LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function Admin() {
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

  const handleLogout = () => {
    clearAuthenticated();
    navigate('/login');
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-2.5 px-3.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all";
  const labelClass = "block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5";

  return (
    <div
      className="min-h-screen bg-[#131313] text-neutral-200"
      style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <span className="text-sm font-bold text-white/90 tracking-tight">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">new archive</span>
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/25 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
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
          {/* Image URL */}
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

          {/* Date */}
          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-3.5 h-3.5 text-red-400" />
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

          {/* Details */}
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
                <label className={labelClass}>Tags <span className="text-white/15 normal-case tracking-normal font-normal">comma separated</span></label>
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

          {/* Status messages */}
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

          {/* Submit */}
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
