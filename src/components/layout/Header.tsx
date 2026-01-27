import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <header className="bg-card sticky top-0 z-40 shadow-md px-5 py-3">
      <div className="flex items-center justify-between mb-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-sm shadow-brand">
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-foreground">
              Desa<span className="text-primary">Mart</span>
            </h1>
            <p className="text-[9px] text-muted-foreground font-medium tracking-wide">
              EKOSISTEM UMKM
            </p>
          </div>
        </Link>
        
        <Link 
          to="/cart" 
          className="relative cursor-pointer hover:scale-105 transition"
        >
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground border border-border">
            <ShoppingCart className="h-4 w-4" />
          </div>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-card text-[8px] flex items-center justify-center text-destructive-foreground font-bold">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
