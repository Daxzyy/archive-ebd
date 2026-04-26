import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import { getSupabase, Archive } from '../lib/supabase';
import Navbar from '../components/Navbar';
import ArchiveCard from '../components/ArchiveCard';
import ArchiveModal from '../components/ArchiveModal';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  isAuth: boolean;
  onAuthChange?: () => void;
}

export default function Dashboard({ isAuth, onAuthChange }: DashboardProps) {
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<string[]>([]);

  useEffect(() => {
    fetchArchives();
  }, []);

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

  const filteredArchives = archives.filter(a => {
    const matchesSearch =
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      a.source?.toLowerCase().includes(search.toLowerCase());

    const matchesTag = selectedTag === 'All' || a.tags?.includes(selectedTag);
    const matchesYear =
      selectedYear === 'All' ||
      (a.date && new Date(a.date).getFullYear().toString() === selectedYear);

    return matchesSearch && matchesTag && matchesYear;
  });

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <Navbar isAuth={isAuth} onAuthChange={onAuthChange} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 border-r border-border p-6 flex-shrink-0 flex-col gap-8 hidden md:flex">
          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-muted mb-4 mono-text font-bold">Navigation</div>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-border text-accent transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => isAuth ? navigate('/admin') : navigate('/login')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-border transition-colors text-left"
              >
                <PlusCircle className="w-4 h-4" /> {isAuth ? 'Add Archive' : 'Access Archive'}
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-muted mb-4 mono-text font-bold">Filters</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mono-text">Year</p>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg py-2 px-3 text-xs text-muted focus:outline-none focus:border-accent transition-all cursor-pointer appearance-none"
                >
                  <option value="All">All Years</option>
                  {allYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mono-text">Category</p>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg py-2 px-3 text-xs text-muted focus:outline-none focus:border-accent transition-all cursor-pointer appearance-none"
                >
                  <option value="All">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Archives</h2>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search archives..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition-all"
                />
              </div>
              {isAuth && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 h-10 px-4 rounded-lg bg-accent text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden lg:inline">Upload New</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl h-60 animate-pulse border border-border" />
                ))}
              </div>
            ) : filteredArchives.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredArchives.map((a) => (
                    <ArchiveCard
                      key={a.id}
                      archive={a}
                      onClick={() => setSelectedArchive(a)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-border-hover" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest mono-text text-muted">No Results</h3>
                <p className="text-xs text-gray-600 mt-2">Adjust your filters to see more archives</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-8 border-t border-border flex items-center justify-center px-6 flex-shrink-0">
        <p className="text-[10px] mono-text text-gray-700 uppercase tracking-widest">
          © 2026 Eberardos Community Archive
        </p>
      </footer>

      <ArchiveModal
        archive={selectedArchive}
        onClose={() => setSelectedArchive(null)}
      />
    </div>
  );
}
