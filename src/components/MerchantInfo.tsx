import { Star, MapPin, Clock, BadgeCheck, Flame } from 'lucide-react';
import type { Merchant } from '@/types';
import { cn } from '@/lib/utils';

interface MerchantInfoProps {
  merchant: Merchant;
  compact?: boolean;
}

export function MerchantInfo({ merchant, compact = false }: MerchantInfoProps) {
  const isOpen = merchant.isOpen;
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 bg-secondary rounded-xl border border-border',
      compact && 'p-2'
    )}>
      <div className="w-10 h-10 bg-muted rounded-full overflow-hidden flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-sm">
          {merchant.name.charAt(0)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-sm text-foreground truncate">{merchant.name}</p>
          {merchant.badge === 'VERIFIED' && (
            <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
          )}
          {merchant.badge === 'POPULAR' && (
            <Flame className="h-4 w-4 text-accent flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {merchant.villageName}
          </span>
          <span>•</span>
          <span className={cn(
            'flex items-center gap-0.5',
            isOpen ? 'status-open' : 'status-closed'
          )}>
            <Clock className="h-2.5 w-2.5" />
            {isOpen ? 'Buka' : 'Tutup'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-0.5 text-gold">
          <Star className="h-3 w-3 fill-current" />
          <span className="text-xs font-bold text-foreground">{merchant.ratingAvg}</span>
        </div>
        <span className="text-[9px] text-muted-foreground">
          ({merchant.ratingCount})
        </span>
      </div>
    </div>
  );
}
