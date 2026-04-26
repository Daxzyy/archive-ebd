import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Calendar as CalendarIcon, 
  Tag, 
  User, 
  CheckCircle, 
  AlertTriangle,
  PlusCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
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

    // Validate URL format only (no fetch to avoid CORS issues)
    try {
      new URL(imageUrl);
    } catch {
      setError('Invalid image URL format.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase.from('archives').insert([
        {
          image_url: imageUrl,
          description,
          date: dateUnknown ? null : date || null,
          date_unknown: dateUnknown,
          tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
          source,
        },
      ]);

      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess(true);
        setImageUrl('');
        setDescription('');
        setDate('');
        setDateUnknown(false);
        setTags('');
        setSource('');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar isAuth={true} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mono-text"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Archives
            </button>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white pixel-text tracking-tighter">DATA INGESTION</h1>
              <p className="text-muted text-sm mono-text uppercase tracking-[0.2em]">Add new record to the Eberardos Repository</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-accent-soft px-4 py-2 rounded-2xl border border-accent/20">
            <PlusCircle className="w-4 h-4 text-accent" />
            <span className="text-accent text-xs font-bold uppercase tracking-widest mono-text">Admin Session Active</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Media Source</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Image CDN URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example-cdn.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono text-xs"
                  />
                </div>

                {imageUrl && (
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-bg border border-border">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      onError={() => setError('Image failed to load in preview')}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white mono-text uppercase tracking-widest">Live Preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Temporal Metadata</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Capture Date</label>
                    <input
                      type="date"
                      disabled={dateUnknown}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono text-xs disabled:opacity-30"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-bg/30 rounded-2xl cursor-pointer border border-transparent hover:border-border transition-all group">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${dateUnknown ? 'bg-accent border-accent' : 'border-border-hover'}`}>
                      {dateUnknown && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={dateUnknown}
                      onChange={(e) => setDateUnknown(e.target.checked)}
                    />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-widest mono-text">Date is currently unknown</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <FileText className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Contextual Data</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Brief Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed description of the chat content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm resize-none font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Source Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      placeholder="WhatsApp Group"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full bg-bg/50 border border-border rounded-2xl py-4 pl-12 pr-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <Tag className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Classification</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="funny, lore..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.split(',').filter(t => t.trim()).map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-border text-accent rounded-lg text-[10px] font-mono font-bold tracking-tight border border-white/5 uppercase">
                      [{t.trim()}]
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-5 bg-accent/5 border border-accent/20 rounded-3xl flex items-center gap-4 text-accent"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-[11px] font-bold uppercase tracking-widest mono-text">ERROR: {error}</div>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-5 bg-green-500/5 border border-green-500/20 rounded-3xl flex items-center gap-4 text-green-500"
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div className="text-[11px] font-bold uppercase tracking-widest mono-text">SUCCESS: RECORD COMMITTED</div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full md:w-auto md:min-w-[320px] bg-accent hover:opacity-90 disabled:bg-border text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-4 active:scale-[0.98] group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin opacity-50" />
              ) : success ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <>
                  <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  <span className="font-sans text-sm tracking-[0.2em] uppercase font-black">Archive Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      
      <footer className="py-12 border-t border-border mt-20">
        <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold mono-text">
          © 2026 Eberardos Community
        </p>
      </footer>
    </div>
  );
}
