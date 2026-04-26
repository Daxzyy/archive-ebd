import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, User, Image as ImageIcon, ExternalLink, Info } from 'lucide-react';
import { Archive } from '../lib/supabase';
import { formatDate } from '../lib/utils';

interface Props {
  archive: Archive | null;
  onClose: () => void;
}

export default function ArchiveModal({ archive, onClose }: Props) {
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
          {/* Close Button Mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full md:hidden"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Section */}
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

          {/* Details Section */}
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
