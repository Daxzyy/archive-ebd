import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, X, LogOut, Lock, ChevronRight, Calendar } from 'lucide-react';
import { getSupabase, Archive } from '../lib/supabase';
import ArchiveModal from '../components/ArchiveModal';
import { motion, AnimatePresence } from 'motion/react';
import { clearAuthenticated } from '../lib/auth';
import { formatDate } from '../lib/utils';

interface DashboardProps {
  isAuth: boolean;
  onAuthChange?: () => void;
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
      {/* Image */}
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

      {/* Content */}
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

export default function Dashboard({ isAuth, onAuthChange }: DashboardProps) {
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
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
      data?.forEach(a => {
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

  const handleLogout = () => {
    clearAuthenticated();
    onAuthChange?.();
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

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between" style={{ height: 52 }}>
          <span className="text-sm font-bold text-white/90 tracking-tight">
            Eberardos
            <span className="text-white/20 mx-1.5 font-light">/</span>
            <span className="text-white/40 font-medium">archive</span>
          </span>
          <div className="flex items-center gap-2">
            {isAuth ? (
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

        {/* Sidebar — desktop only */}
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

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
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
              {/* Mobile search */}
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

          {/* Grid */}
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

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-5 mt-4">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[11px] text-white/20">© 2026 Eberardos Community</p>
        </div>
      </footer>

      <ArchiveModal archive={selectedArchive} onClose={() => setSelectedArchive(null)} />
    </div>
  );
}
