import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { AddressSelector, createEmptyAddressData, formatFullAddress, type AddressData } from '@/components/AddressSelector';
import type { SavedAddress, SavedAddressInput } from '@/hooks/useSavedAddresses';

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: SavedAddress | null;
  onSave: (data: SavedAddressInput) => Promise<boolean | SavedAddress | null>;
}

const LABEL_OPTIONS = ['Rumah', 'Kantor', 'Apartemen', 'Kos', 'Lainnya'];

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSave,
}: AddressFormDialogProps) {
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>(createEmptyAddressData());

  const isEditing = !!address;

  useEffect(() => {
    if (address) {
      setLabel(address.label);
      setRecipientName(address.recipient_name);
      setPhone(address.phone);
      setIsDefault(address.is_default);
      setAddressData({
        province: address.province_id || '',
        provinceName: address.province_name || '',
        city: address.city_id || '',
        cityName: address.city_name || '',
        district: address.district_id || '',
        districtName: address.district_name || '',
        village: address.village_id || '',
        villageName: address.village_name || '',
        detail: address.address_detail || '',
      });
    } else {
      setLabel('Rumah');
      setRecipientName('');
      setPhone('');
      setIsDefault(false);
      setAddressData(createEmptyAddressData());
    }
  }, [address, open]);

  const handleSave = async () => {
    if (!recipientName.trim() || !phone.trim()) return;

    setSaving(true);
    try {
      const data: SavedAddressInput = {
        label,
        recipient_name: recipientName.trim(),
        phone: phone.trim(),
        province_id: addressData.province || undefined,
        province_name: addressData.provinceName || undefined,
        city_id: addressData.city || undefined,
        city_name: addressData.cityName || undefined,
        district_id: addressData.district || undefined,
        district_name: addressData.districtName || undefined,
        village_id: addressData.village || undefined,
        village_name: addressData.villageName || undefined,
        address_detail: addressData.detail || undefined,
        full_address: formatFullAddress(addressData) || undefined,
        is_default: isDefault,
      };

      const result = await onSave(data);
      if (result) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const isValid = recipientName.trim() && phone.trim() && phoneValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Alamat' : 'Tambah Alamat Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Perbarui detail alamat Anda' : 'Simpan alamat baru untuk pengiriman'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label Selection */}
          <div className="space-y-2">
            <Label>Label Alamat</Label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant={label === opt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLabel(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label>Nama Penerima *</Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nama lengkap penerima"
              disabled={saving}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>No. Telepon *</Label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              onValidationChange={setPhoneValid}
              disabled={saving}
            />
          </div>

          {/* Address Selector */}
          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <AddressSelector
              value={addressData}
              onChange={setAddressData}
              disabled={saving}
            />
          </div>

          {/* Default Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="font-medium">Jadikan Alamat Utama</Label>
              <p className="text-xs text-muted-foreground">
                Alamat ini akan dipilih otomatis saat checkout
              </p>
            </div>
            <Switch
              checked={isDefault}
              onCheckedChange={setIsDefault}
              disabled={saving}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !isValid}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Alamat'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
