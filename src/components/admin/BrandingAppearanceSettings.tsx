import { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Palette, Globe, Type, Upload, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useWhitelabel } from '@/hooks/useWhitelabel';

interface PWASettings {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  enableOffline: boolean;
  enableNotifications: boolean;
  enableInstallPrompt: boolean;
  installPromptDelay: number;
  showInstallBanner: boolean;
  icons: {
    src: string;
    sizes: string;
    type: string;
  }[];
}

interface WhitelabelSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

const defaultPWASettings: PWASettings = {
  appName: 'DesaMart - Marketplace UMKM & Desa Wisata',
  shortName: 'DesaMart',
  description: 'Jelajahi produk UMKM asli desa dan destinasi wisata desa di Indonesia',
  themeColor: '#10b981',
  backgroundColor: '#ffffff',
  enableOffline: true,
  enableNotifications: true,
  enableInstallPrompt: true,
  installPromptDelay: 30,
  showInstallBanner: true,
  icons: [
    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
};

const defaultWhitelabelSettings: WhitelabelSettings = {
  siteName: 'DesaMart',
  siteTagline: 'EKOSISTEM UMKM',
  logoUrl: null,
  faviconUrl: null,
};

interface BrandingAppearanceSettingsProps {
  isSaving?: string | null;
  onSave?: (key: string, values: any) => Promise<void>;
}

export function BrandingAppearanceSettings({ isSaving, onSave }: BrandingAppearanceSettingsProps) {
  const { refetch: refetchWhitelabel } = useWhitelabel();
  
  // PWA Settings State
  const [pwaSettings, setPwaSettings] = useState<PWASettings>(defaultPWASettings);
  const [uploading, setUploading] = useState<string | null>(null);
  
  // Whitelabel Settings State
  const [siteName, setSiteName] = useState('DesaMart');
  const [siteTagline, setSiteTagline] = useState('EKOSISTEM UMKM');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  
  // Loading State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      // Fetch PWA Settings
      const { data: pwaData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('category', 'pwa')
        .single();

      if (pwaData && pwaData.value) {
        const savedPWASettings = pwaData.value as unknown as Partial<PWASettings>;
        setPwaSettings({ ...defaultPWASettings, ...savedPWASettings });
      }

      // Fetch Whitelabel Settings
      const { data: whitelabelData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('category', 'whitelabel');

      if (whitelabelData) {
        whitelabelData.forEach((item) => {
          if (item.key === 'site_name') setSiteName(String(item.value) || 'DesaMart');
          if (item.key === 'site_tagline') setSiteTagline(String(item.value) || 'EKOSISTEM UMKM');
          if (item.key === 'logo_url') setLogoUrl(item.value ? String(item.value) : null);
          if (item.key === 'favicon_url') setFaviconUrl(item.value ? String(item.value) : null);
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePWA = async () => {
    setSaving('pwa');
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'pwa_config',
          category: 'pwa',
          value: pwaSettings as any,
          description: 'Progressive Web App configuration',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Pengaturan PWA berhasil disimpan');
    } catch (error) {
      console.error('Error saving PWA settings:', error);
      toast.error('Gagal menyimpan pengaturan PWA');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveWhitelabel = async () => {
    setSaving('whitelabel');
    try {
      const saveSetting = async (key: string, value: string | null) => {
        const { data: existing } = await supabase
          .from('app_settings')
          .select('id')
          .eq('key', key)
          .eq('category', 'whitelabel')
          .maybeSingle();

        if (existing) {
          await supabase
            .from('app_settings')
            .update({ value: value as unknown as null, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('app_settings')
            .insert({
              key,
              value: value as unknown as null,
              category: 'whitelabel',
              description: `Whitelabel setting: ${key}`,
            });
        }
      };

      await Promise.all([
        saveSetting('site_name', siteName),
        saveSetting('site_tagline', siteTagline),
        saveSetting('logo_url', logoUrl),
        saveSetting('favicon_url', faviconUrl),
      ]);

      await refetchWhitelabel();
      toast.success('Pengaturan Whitelabel berhasil disimpan');
    } catch (error) {
      console.error('Error saving whitelabel settings:', error);
      toast.error('Gagal menyimpan pengaturan Whitelabel');
    } finally {
      setSaving(null);
    }
  };

  const handlePWAChange = (key: keyof PWASettings, value: any) => {
    setPwaSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, size: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('jpeg')) {
      toast.error('Hanya file PNG atau JPEG yang diperbolehkan');
      return;
    }

    setUploading(size);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `pwa-icon-${size}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pwa/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      const updatedIcons = pwaSettings.icons.map(icon => 
        icon.sizes === size ? { ...icon, src: publicUrl, type: file.type } : icon
      );

      setPwaSettings(prev => ({ ...prev, icons: updatedIcons }));
      toast.success(`Ikon ${size} berhasil diunggah`);
    } catch (error: any) {
      console.error('Error uploading icon:', error);
      toast.error('Gagal mengunggah ikon: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity">Identitas</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="pwa">Fitur Mobile</TabsTrigger>
        </TabsList>

        {/* Identity Tab - Whitelabel */}
        <TabsContent value="identity" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Identitas Brand
                </CardTitle>
                <CardDescription>
                  Ubah nama dan tagline website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nama Website</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Nama website Anda"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ditampilkan di header dan title browser
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Tagline website"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ditampilkan di bawah nama website
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo
                </CardTitle>
                <CardDescription>
                  Upload logo untuk header website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo Website</Label>
                  <ImageUpload
                    value={logoUrl || ''}
                    onChange={(url) => setLogoUrl(url)}
                    bucket="merchant-images"
                    path="whitelabel/logo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Rekomendasi: PNG transparan, 200x200px
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Favicon
                </CardTitle>
                <CardDescription>
                  Ikon yang tampil di tab browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <ImageUpload
                    value={faviconUrl || ''}
                    onChange={(url) => setFaviconUrl(url)}
                    bucket="merchant-images"
                    path="whitelabel/favicon"
                  />
                  <p className="text-xs text-muted-foreground">
                    Rekomendasi: ICO atau PNG, 32x32px
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview Header</CardTitle>
                <CardDescription>
                  Tampilan header dengan pengaturan saat ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-sm">
                        {siteName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h1 className="font-bold text-sm leading-none text-foreground">
                        {siteName}
                      </h1>
                      <p className="text-[9px] text-muted-foreground font-medium tracking-wide">
                        {siteTagline}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleSaveWhitelabel} disabled={saving === 'whitelabel'}>
            {saving === 'whitelabel' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Pengaturan Whitelabel
          </Button>
        </TabsContent>

        {/* Appearance Tab - Colors */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Warna Tema
              </CardTitle>
              <CardDescription>
                Atur warna tema untuk PWA dan aplikasi web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Warna Tema (Theme Color)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="themeColor"
                      type="color"
                      value={pwaSettings.themeColor}
                      onChange={(e) => handlePWAChange('themeColor', e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={pwaSettings.themeColor}
                      onChange={(e) => handlePWAChange('themeColor', e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digunakan untuk address bar dan splash screen
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Warna Latar (Background Color)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={pwaSettings.backgroundColor}
                      onChange={(e) => handlePWAChange('backgroundColor', e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={pwaSettings.backgroundColor}
                      onChange={(e) => handlePWAChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Warna latar splash screen saat aplikasi loading
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSavePWA} disabled={saving === 'pwa'}>
            {saving === 'pwa' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Warna Tema
          </Button>
        </TabsContent>

        {/* PWA Technical Tab */}
        <TabsContent value="pwa" className="space-y-4">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Status PWA
              </CardTitle>
              <CardDescription>
                Progressive Web App memungkinkan pengguna menginstall aplikasi langsung dari browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  PWA Aktif
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Service Worker: Aktif
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Manifest: Valid
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  HTTPS: Aman
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informasi Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nama Aplikasi</Label>
                  <Input
                    id="appName"
                    value={pwaSettings.appName}
                    onChange={(e) => handlePWAChange('appName', e.target.value)}
                    placeholder="Nama lengkap aplikasi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ditampilkan di splash screen dan about
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Nama Singkat</Label>
                  <Input
                    id="shortName"
                    value={pwaSettings.shortName}
                    onChange={(e) => handlePWAChange('shortName', e.target.value)}
                    placeholder="Nama singkat (max 12 karakter)"
                    maxLength={12}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ditampilkan di homescreen
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={pwaSettings.description}
                  onChange={(e) => handlePWAChange('description', e.target.value)}
                  placeholder="Deskripsi singkat aplikasi"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Icon Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Ikon Aplikasi
              </CardTitle>
              <CardDescription>
                Ikon yang digunakan untuk homescreen dan splash screen. Pastikan ukuran dan tipe file sesuai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {pwaSettings.icons.map((icon, index) => (
                  <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                        {uploading === icon.sizes ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <img src={icon.src} alt={`Icon ${icon.sizes}`} className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Label className="font-bold">{icon.sizes}</Label>
                          <Badge variant="outline" className="text-[10px]">{icon.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{icon.src}</p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Tervalidasi</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleIconUpload(e, icon.sizes)}
                        className="hidden"
                        id={`icon-upload-${icon.sizes}`}
                        disabled={uploading !== null}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        asChild
                        disabled={uploading !== null}
                      >
                        <label htmlFor={`icon-upload-${icon.sizes}`} className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Ganti Ikon {icon.sizes}
                        </label>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tips Ikon PWA</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Gunakan format <strong>PNG</strong> untuk transparansi dan kualitas terbaik.</li>
                    <li>Pastikan ukuran tepat (192x192 dan 512x512 piksel).</li>
                    <li>Ikon 512x512 digunakan untuk splash screen berkualitas tinggi.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSavePWA} disabled={saving === 'pwa'}>
            {saving === 'pwa' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Pengaturan PWA
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
