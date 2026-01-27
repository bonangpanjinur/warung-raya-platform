import { Link } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tourism } from '@/types';

interface TourismCardProps {
  tourism: Tourism;
  index?: number;
}

export function TourismCard({ tourism, index = 0 }: TourismCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/tourism/${tourism.id}`}
        className="block rounded-2xl overflow-hidden relative shadow-md cursor-pointer group"
      >
        <div className="h-48 overflow-hidden">
          <img 
            src={tourism.image} 
            alt={tourism.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent p-4 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            {tourism.viewCount && (
              <span className="bg-card/20 backdrop-blur text-primary-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {tourism.viewCount.toLocaleString('id-ID')} views
              </span>
            )}
          </div>
          <h3 className="text-primary-foreground font-bold text-base leading-tight">
            {tourism.name}
          </h3>
          <div className="flex items-center gap-1 text-primary-foreground/70 text-xs mt-1">
            <MapPin className="h-3 w-3" />
            {tourism.villageName}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
