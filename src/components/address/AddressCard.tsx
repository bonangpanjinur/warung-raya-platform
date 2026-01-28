import { MapPin, Phone, Star, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SavedAddress } from '@/hooks/useSavedAddresses';

interface AddressCardProps {
  address: SavedAddress;
  onEdit?: (address: SavedAddress) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onSelect?: (address: SavedAddress) => void;
  selectable?: boolean;
  selected?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  selectable = false,
  selected = false,
}: AddressCardProps) {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  return (
    <Card
      className={`relative transition-all ${
        selectable ? 'cursor-pointer hover:border-primary' : ''
      } ${selected ? 'border-primary ring-2 ring-primary/20' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {address.label}
              </Badge>
              {address.is_default && (
                <Badge className="text-xs bg-primary/10 text-primary border-0">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Utama
                </Badge>
              )}
            </div>
            
            <p className="font-medium text-sm">{address.recipient_name}</p>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              <span>{address.phone}</span>
            </div>
            
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {address.full_address || [
                  address.address_detail,
                  address.village_name,
                  address.district_name,
                  address.city_name,
                  address.province_name,
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>

          {!selectable && (onEdit || onDelete || onSetDefault) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(address)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onSetDefault && !address.is_default && (
                  <DropdownMenuItem onClick={() => onSetDefault(address.id)}>
                    <Star className="h-4 w-4 mr-2" />
                    Jadikan Utama
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(address.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
