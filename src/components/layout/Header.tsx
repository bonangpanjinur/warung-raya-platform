import { Link } from 'react-router-dom';
import { Bell, Leaf } from 'lucide-react';

export function Header() {
  // TODO: Implement notification count from backend
  const notificationCount = 0;

  return (
    <header className="bg-card sticky top-0 z-40 shadow-md px-5 py-3">
      <div className="flex items-center justify-between">
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
        
        <button 
          className="relative cursor-pointer hover:scale-105 transition"
          aria-label="Notifications"
        >
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground border border-border">
            <Bell className="h-4 w-4" />
          </div>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-card text-[8px] flex items-center justify-center text-destructive-foreground font-bold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
