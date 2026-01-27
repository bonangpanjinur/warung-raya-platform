import { motion } from 'framer-motion';
import { Receipt, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export default function OrdersPage() {
  const { items } = useCart();
  
  return (
    <div className="mobile-shell bg-background flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 overflow-y-auto pb-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-4"
        >
          <h1 className="text-xl font-bold text-foreground mb-1">Pesanan Saya</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Kelola dan lacak pesanan Anda
          </p>
          
          {/* Cart Summary if items exist */}
          {items.length > 0 && (
            <Link 
              to="/cart"
              className="block bg-brand-light border border-primary/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Keranjang Aktif</p>
                    <p className="text-xs text-muted-foreground">{items.length} item menunggu checkout</p>
                  </div>
                </div>
                <Button size="sm">Lihat</Button>
              </div>
            </Link>
          )}
          
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-1">Belum Ada Pesanan</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pesanan Anda akan muncul di sini setelah checkout
            </p>
            <Link to="/">
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      <BottomNav />
    </div>
  );
}
