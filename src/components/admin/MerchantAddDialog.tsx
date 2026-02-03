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
import {
  fetchProvinces,
  fetchRegencies,
  fetchDistricts,
  fetchVillages,
  Region,
} from '@/lib/addressApi';

interface MerchantAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface VillageData {
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

export function MerchantAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: MerchantAddDialogProps) {
  const [loading, setLoading] = useState(false);
  
  // Address data states
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [apiVillages, setApiVillages] = useState<Region[]>([]);
  const [dbVillages, setDbVillages] = useState<VillageData[]>([]);
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province_code: '',
    province_name: '',
    regency_code: '',
    regency_name: '',
    district_code: '',
    district_name: '',
    village_code: '',
    village_name: '',
    address: '',
    open_time: '08:00',
    close_time: '17:00',
    business_category: 'kuliner',
    business_description: '',
    classification_price: 'FROM_5K_TO_10K',
    is_open: true,
    status: 'ACTIVE',
    registration_status: 'APPROVED',
    village_id: '', // Linked village ID if exists
  });

  // Load provinces on dialog open
  useEffect(() => {
    if (open) {
      loadProvinces();
    }
  }, [open]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await fetchProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Gagal memuat data provinsi');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (code: string) => {
    const selected = provinces.find(p => p.code === code);
    if (!selected) return;

    setFormData({
      ...formData,
      province_code: code,
      province_name: selected.name,
      regency_code: '',
      regency_name: '',
      district_code: '',
      district_name: '',
      village_code: '',
      village_name: '',
      village_id: '',
    });

    setRegencies([]);
    setDistricts([]);
    setApiVillages([]);
    setDbVillages([]);

    setLoadingRegencies(true);
    try {
      const data = await fetchRegencies(code);
      setRegencies(data);
    } catch (error) {
      console.error('Error loading regencies:', error);
      toast.error('Gagal memuat data kabupaten/kota');
    } finally {
      setLoadingRegencies(false);
    }
  };

  const handleRegencyChange = async (code: string) => {
    const selected = regencies.find(r => r.code === code);
    if (!selected) return;

    setFormData({
      ...formData,
      regency_code: code,
      regency_name: selected.name,
      district_code: '',
      district_name: '',
      village_code: '',
      village_name: '',
      village_id: '',
    });

    setDistricts([]);
    setApiVillages([]);
    setDbVillages([]);

    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts(code);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Gagal memuat data kecamatan');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (code: string) => {
    const selected = districts.find(d => d.code === code);
    if (!selected) return;

    setFormData({
      ...formData,
      district_code: code,
      district_name: selected.name,
      village_code: '',
      village_name: '',
      village_id: '',
    });

    setApiVillages([]);
    setDbVillages([]);

    setLoadingVillages(true);
    try {
      // Fetch API villages
      const apiData = await fetchVillages(code);
      setApiVillages(apiData);

      // Fetch DB villages that match this location
      const { data: dbData, error } = await supabase
        .from('villages')
        .select('id, name, district, regency, subdistrict')
        .eq('district', selected.name)
        .eq('regency', formData.regency_name)
        .eq('is_active', true);

      if (error) throw error;
      setDbVillages(dbData || []);
    } catch (error) {
      console.error('Error loading villages:', error);
      toast.error('Gagal memuat data kelurahan');
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleVillageChange = (code: string) => {
    const selected = apiVillages.find(v => v.code === code);
    if (!selected) return;

    // Try to find matching village in database
    const matchingDbVillage = dbVillages.find(
      v => v.name.toLowerCase() === selected.name.toLowerCase()
    );

    setFormData({
      ...formData,
      village_code: code,
      village_name: selected.name,
      village_id: matchingDbVillage?.id || '', // Link to village if exists
    });
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

    if (!formData.province_code) {
      toast.error('Provinsi wajib dipilih');
      return;
    }

    if (!formData.regency_code) {
      toast.error('Kabupaten/Kota wajib dipilih');
      return;
    }

    if (!formData.district_code) {
      toast.error('Kecamatan wajib dipilih');
      return;
    }

    if (!formData.village_code) {
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
          village_id: formData.village_id || null, // Null if not linked to a tourism village
          province: formData.province_name,
          city: formData.regency_name,
          district: formData.district_name,
          subdistrict: formData.village_name,
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
        province_code: '',
        province_name: '',
        regency_code: '',
        regency_name: '',
        district_code: '',
        district_name: '',
        village_code: '',
        village_name: '',
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

          {/* Address Information - Cascading Dropdowns */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Alamat Lengkap</h3>
            
            {/* Provinsi */}
            <div>
              <Label>Provinsi *</Label>
              <Select
                value={formData.province_code}
                onValueChange={handleProvinceChange}
                disabled={loading || loadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProvinces ? 'Memuat...' : 'Pilih Provinsi'} />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.code} value={province.code}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kabupaten/Kota */}
            <div className="mt-3">
              <Label>Kabupaten/Kota *</Label>
              <Select
                value={formData.regency_code}
                onValueChange={handleRegencyChange}
                disabled={loading || loadingRegencies || !formData.province_code}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !formData.province_code 
                        ? 'Pilih Provinsi terlebih dahulu'
                        : loadingRegencies 
                        ? 'Memuat...' 
                        : 'Pilih Kabupaten/Kota'
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {regencies.map((regency) => (
                    <SelectItem key={regency.code} value={regency.code}>
                      {regency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kecamatan */}
            <div className="mt-3">
              <Label>Kecamatan *</Label>
              <Select
                value={formData.district_code}
                onValueChange={handleDistrictChange}
                disabled={loading || loadingDistricts || !formData.regency_code}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !formData.regency_code 
                        ? 'Pilih Kabupaten/Kota terlebih dahulu'
                        : loadingDistricts 
                        ? 'Memuat...' 
                        : 'Pilih Kecamatan'
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kelurahan/Desa */}
            <div className="mt-3">
              <Label>Kelurahan/Desa *</Label>
              <Select
                value={formData.village_code}
                onValueChange={handleVillageChange}
                disabled={loading || loadingVillages || !formData.district_code}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !formData.district_code 
                        ? 'Pilih Kecamatan terlebih dahulu'
                        : loadingVillages 
                        ? 'Memuat...' 
                        : 'Pilih Kelurahan/Desa'
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {apiVillages.map((village) => {
                    const isLinked = dbVillages.some(
                      v => v.name.toLowerCase() === village.name.toLowerCase()
                    );
                    return (
                      <SelectItem key={village.code} value={village.code}>
                        {village.name} {isLinked ? '✓ (Terhubung ke Desa Wisata)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {formData.village_id && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Merchant akan terhubung ke Desa Wisata
                </p>
              )}
              {formData.village_code && !formData.village_id && (
                <p className="text-xs text-amber-600 mt-1">
                  ℹ Merchant berstatus independen (tidak terhubung ke Desa Wisata)
                </p>
              )}
            </div>

            {/* Alamat Detail */}
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
