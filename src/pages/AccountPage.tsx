import { motion } from 'framer-motion';
import { User, Settings, HelpCircle, LogIn, Store, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  return (
    <div className="mobile-shell bg-background flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 overflow-y-auto pb-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-4"
        >
          {/* Guest State */}
          <div className="bg-card rounded-2xl p-6 border border-border text-center mb-6">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-1">Masuk ke Akun</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola pesanan dan lihat riwayat belanja
            </p>
            <Button className="w-full shadow-brand">
              <LogIn className="h-4 w-4 mr-2" />
              Masuk / Daftar
            </Button>
          </div>
          
          {/* Merchant CTA */}
          <div className="bg-gradient-to-r from-primary to-brand-dark rounded-2xl p-5 mb-6 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-5 w-5" />
                <h3 className="font-bold">Daftar UMKM</h3>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Ingin jualan di DesaMart? Hubungi admin untuk pendaftaran.
              </p>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => window.open('https://wa.me/6281234567890?text=Halo, saya ingin mendaftar sebagai pedagang di DesaMart', '_blank')}
              >
                Hubungi Admin
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-foreground/10 rounded-full" />
          </div>
          
          {/* Menu Items */}
          <div className="space-y-2">
            <Link 
              to="/help"
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary transition"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Bantuan</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            
            <Link 
              to="/settings"
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary transition"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Pengaturan</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            DesaMart v1.0.0 • Platform UMKM Desa
          </p>
        </motion.div>
      </div>
      
      <BottomNav />
    </div>
  );
}
