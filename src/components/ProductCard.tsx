import { Link } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden relative group cursor-pointer block card-hover"
      >
        {product.isPromo && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-destructive text-destructive-foreground text-[8px] font-bold px-1.5 py-0.5 rounded">
              PROMO
            </span>
          </div>
        )}
        
        <div className="h-32 bg-muted overflow-hidden relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        
        <div className="p-2.5">
          <div className="text-[9px] text-muted-foreground mb-0.5 truncate flex items-center gap-1">
            {product.merchantName}
            <Star className="h-2 w-2 text-gold fill-gold" />
          </div>
          <h3 className="font-bold text-xs text-card-foreground line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
          <div className="flex justify-between items-center mt-1.5">
            <p className="text-primary font-bold text-xs">
              {formatPrice(product.price)}
            </p>
            <button
              onClick={handleAddToCart}
              className="w-6 h-6 rounded-lg bg-brand-light text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
