import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export function FloatingCartButton() {
  const { items, getItemCount, getCartTotal } = useCart();
  const itemCount = getItemCount();
  const subtotal = getCartTotal();

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <Link
          to="/cart"
          className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-lg hover:bg-brand-dark transition-all hover:scale-105"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-bold border-2 border-primary">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          </div>
          <div className="border-l border-primary-foreground/30 pl-3">
            <p className="text-[10px] opacity-80">Total</p>
            <p className="font-bold text-sm">{formatPrice(subtotal)}</p>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
