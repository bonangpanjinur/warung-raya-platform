import { useState, useEffect } from 'react';
import { Clock, Save, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MerchantAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Village {
  id: string;
  name: string;
  district: string;
  regency: string;
  subdistrict: string | null;
}

const BUSINESS_CATEGORIES = [
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'kriya', label: 'Kriya & Kerajinan' },
  { value: 'jasa', label: 'Jasa' },
  { value: 'pertanian', label: 'Pertanian' },
  { value: 'lainnya', label: 'Lainnya' },
];

const CLASSIFICATION_PRICES = [
  { value: 'UNDER_5K', label: 'Dibawah Rp 5.000' },
  { value: 'FROM_5K_TO_10K', label: 'Rp 5.000 - Rp 10.000' },
  { value: 'FROM_10K_TO_20K', label: 'Rp 10.000 - Rp 20.000' },
  { value: 'ABOVE_20K', label: 'Diatas Rp 20.000' },
];

// Indonesian provinces
const PROVINCES = [
  { value: 'Aceh', label: 'Aceh' },
  { value: 'Sumatera Utara', label: 'Sumatera Utara' },
  { value: 'Sumatera Barat', label: 'Sumatera Barat' },
  { value: 'Riau', label: 'Riau' },
  { value: 'Jambi', label: 'Jambi' },
  { value: 'Sumatera Selatan', label: 'Sumatera Selatan' },
  { value: 'Bengkulu', label: 'Bengkulu' },
  { value: 'Lampung', label: 'Lampung' },
  { value: 'Kepulauan Bangka Belitung', label: 'Kepulauan Bangka Belitung' },
  { value: 'Kepulauan Riau', label: 'Kepulauan Riau' },
  { value: 'DKI Jakarta', label: 'DKI Jakarta' },
  { value: 'Jawa Barat', label: 'Jawa Barat' },
  { value: 'Jawa Tengah', label: 'Jawa Tengah' },
  { value: 'DI Yogyakarta', label: 'DI Yogyakarta' },
  { value: 'Jawa Timur', label: 'Jawa Timur' },
  { value: 'Banten', label: 'Banten' },
  { value: 'Bali', label: 'Bali' },
  { value: 'Nusa Tenggara Barat', label: 'Nusa Tenggara Barat' },
  { value: 'Nusa Tenggara Timur', label: 'Nusa Tenggara Timur' },
  { value: 'Kalimantan Barat', label: 'Kalimantan Barat' },
  { value: 'Kalimantan Tengah', label: 'Kalimantan Tengah' },
  { value: 'Kalimantan Selatan', label: 'Kalimantan Selatan' },
  { value: 'Kalimantan Timur', label: 'Kalimantan Timur' },
  { value: 'Kalimantan Utara', label: 'Kalimantan Utara' },
  { value: 'Sulawesi Utara', label: 'Sulawesi Utara' },
  { value: 'Sulawesi Tengah', label: 'Sulawesi Tengah' },
  { value: 'Sulawesi Selatan', label: 'Sulawesi Selatan' },
  { value: 'Sulawesi Tenggara', label: 'Sulawesi Tenggara' },
  { value: 'Gorontalo', label: 'Gorontalo' },
  { value: 'Sulawesi Barat', label: 'Sulawesi Barat' },
  { value: 'Maluku', label: 'Maluku' },
  { value: 'Maluku Utara', label: 'Maluku Utara' },
  { value: 'Papua', label: 'Papua' },
  { value: 'Papua Barat', label: 'Papua Barat' },
  { value: 'Papua Tengah', label: 'Papua Tengah' },
  { value: 'Papua Pegunungan', label: 'Papua Pegunungan' },
  { value: 'Papua Selatan', label: 'Papua Selatan' },
];

export function MerchantAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: MerchantAddDialogProps) {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    address: '',
    open_time: '08:00',
    close_time: '17:00',
    business_category: 'kuliner',
    business_description: '',
    classification_price: 'FROM_5K_TO_10K',
    is_open: true,
    status: 'ACTIVE',
    registration_status: 'APPROVED',
    village_id: '',
  });

  // Fetch villages on dialog open
  useEffect(() => {
    if (open) {
      fetchVillages();
    }
  }, [open]);

  const fetchVillages = async () => {
    setLoadingVillages(true);
    try {
      const { data, error } = await supabase
        .from('villages')
        .select('id, name, district, regency, subdistrict')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      toast.error('Gagal memuat daftar desa');
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleVillageChange = (villageId: string) => {
    const selectedVillage = villages.find(v => v.id === villageId);
    if (selectedVillage) {
      setFormData({
        ...formData,
        village_id: villageId,
        city: selectedVillage.regency,
        district: selectedVillage.district,
        subdistrict: selectedVillage.subdistrict || '',
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Nama merchant wajib diisi');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Nomor telepon wajib diisi');
      return;
    }

    if (!formData.province.trim()) {
      toast.error('Provinsi wajib diisi');
      return;
    }

    if (!formData.city.trim()) {
      toast.error('Kabupaten/Kota wajib diisi');
      return;
    }

    if (!formData.district.trim()) {
      toast.error('Kecamatan wajib diisi');
      return;
    }

    if (!formData.village_id) {
      toast.error('Kelurahan/Desa wajib dipilih');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .insert({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          open_time: formData.open_time,
          close_time: formData.close_time,
          business_category: formData.business_category,
          business_description: formData.business_description || null,
          classification_price: formData.classification_price,
          is_open: formData.is_open,
          status: formData.status,
          registration_status: formData.registration_status,
          village_id: formData.village_id,
          province: formData.province,
          city: formData.city,
          district: formData.district,
          subdistrict: formData.subdistrict || null,
          registered_at: new Date().toISOString(),
          order_mode: 'ADMIN_ASSISTED',
        });

      if (error) throw error;

      toast.success('Merchant baru berhasil ditambahkan');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        subdistrict: '',
        address: '',
        open_time: '08:00',
        close_time: '17:00',
        business_category: 'kuliner',
        business_description: '',
        classification_price: 'FROM_5K_TO_10K',
        is_open: true,
        status: 'ACTIVE',
        registration_status: 'APPROVED',
        village_id: '',
      });
    } catch (error) {
      console.error('Error adding merchant:', error);
      toast.error('Gagal menambahkan merchant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Merchant Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Informasi Dasar</h3>
            
            <div>
              <Label>Nama Merchant *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama toko/usaha"
                disabled={loading}
              />
            </div>

            <div className="mt-3">
              <Label>Nomor Telepon *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                disabled={loading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Alamat Lengkap</h3>
            
            <div>
              <Label>Provinsi *</Label>
              <Select
                value={formData.province}
                onValueChange={(v) => setFormData({ ...formData, province: v })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3">
              <Label>Kabupaten/Kota *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Kabupaten atau Kota"
                disabled={loading}
              />
            </div>

            <div className="mt-3">
              <Label>Kecamatan *</Label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Kecamatan"
                disabled={loading}
              />
            </div>

            <div className="mt-3">
              <Label>Kelurahan/Desa *</Label>
              <Select
                value={formData.village_id}
                onValueChange={handleVillageChange}
                disabled={loading || loadingVillages}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingVillages ? 'Memuat...' : 'Pilih Kelurahan/Desa'} />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id}>
                      {village.name} - {village.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3">
              <Label>Alamat Detail</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap (jalan, nomor rumah, RT/RW, dll)"
                rows={2}
                disabled={loading}
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Informasi Bisnis</h3>
            
            <div>
              <Label>Kategori Bisnis</Label>
              <Select
                value={formData.business_category}
                onValueChange={(v) => setFormData({ ...formData, business_category: v })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3">
              <Label>Deskripsi Bisnis</Label>
              <Textarea
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                placeholder="Deskripsi singkat tentang usaha"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="mt-3">
              <Label>Klasifikasi Harga</Label>
              <Select
                value={formData.classification_price}
                onValueChange={(v) => setFormData({ ...formData, classification_price: v })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATION_PRICES.map((price) => (
                    <SelectItem key={price.value} value={price.value}>
                      {price.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Jam Operasional</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Jam Buka
                </Label>
                <Input
                  type="time"
                  value={formData.open_time}
                  onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Jam Tutup
                </Label>
                <Input
                  type="time"
                  value={formData.close_time}
                  onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="pb-4">
            <h3 className="font-semibold text-sm mb-3">Status</h3>
            
            <div>
              <Label>Status Merchant</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                  <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Switch
                checked={formData.is_open}
                onCheckedChange={(v) => setFormData({ ...formData, is_open: v })}
                disabled={loading}
              />
              <Label>Toko sedang buka</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
