import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { TourismCard } from '@/components/TourismCard';
import { tourismSpots } from '@/data/mockData';

export default function TourismPage() {
  return (
    <div className="mobile-shell bg-background flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 overflow-y-auto pb-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-4"
        >
          <h1 className="text-xl font-bold text-foreground mb-1">Wisata Desa</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Jelajahi destinasi wisata alam dan budaya
          </p>
          
          <div className="space-y-4">
            {tourismSpots.map((tourism, idx) => (
              <TourismCard key={tourism.id} tourism={tourism} index={idx} />
            ))}
          </div>
        </motion.div>
      </div>
      
      <BottomNav />
    </div>
  );
}
