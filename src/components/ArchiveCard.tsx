import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Tag, ExternalLink } from 'lucide-react';
import { Archive } from '../lib/supabase';
import { formatDate } from '../lib/utils';

interface ArchiveCardProps {
  archive: Archive;
  onClick: () => void;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ archive, onClick }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-border-hover cursor-pointer transition-all flex flex-col"
    >
      <div className="h-[160px] relative overflow-hidden bg-border flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted opacity-20">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <img
          src={archive.image_url}
          alt={archive.description}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-sm text-[10px] mono-text text-accent tracking-tighter border border-white/10 backdrop-blur-md">
          {`WA-IMG-${archive.id.slice(0, 4).toUpperCase()}`}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="text-gray-100 text-sm font-medium line-clamp-2 leading-[1.4]">
          {archive.description || 'No description available'}
        </h3>
        
        <div className="mt-auto flex items-center gap-3 text-[11px] text-muted mono-text uppercase border-t border-border pt-3">
          <Calendar className="w-3 h-3 text-accent" />
          {formatDate(archive.date, archive.date_unknown).toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
};

export default ArchiveCard;
