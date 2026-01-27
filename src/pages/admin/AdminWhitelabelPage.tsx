import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Palette, Type, Image, Loader2, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWhitelabel } from '@/hooks/useWhitelabel';

export default function AdminWhitelabelPage() {
  const { refetch } = useWhitelabel();
  const [siteName, setSiteName] = useState('DesaMart');
  const [siteTagline, setSiteTagline] = useState('EKOSISTEM UMKM');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('category', 'whitelabel');

      if (error) throw error;

      if (data) {
        data.forEach((item) => {
          if (item.key === 'site_name') setSiteName(String(item.value) || 'DesaMart');
          if (item.key === 'site_tagline') setSiteTagline(String(item.value) || 'EKOSISTEM UMKM');
          if (item.key === 'logo_url') setLogoUrl(item.value ? String(item.value) : null);
          if (item.key === 'favicon_url') setFaviconUrl(item.value ? String(item.value) : null);
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('site_name', siteName),
        saveSetting('site_tagline', siteTagline),
        saveSetting('logo_url', logoUrl),
        saveSetting('favicon_url', faviconUrl),
      ]);

      await refetch();
      toast.success('Pengaturan whitelabel berhasil disimpan');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSiteName('DesaMart');
    setSiteTagline('EKOSISTEM UMKM');
    setLogoUrl(null);
    setFaviconUrl(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Whitelabel Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Whitelabel Settings" subtitle="Kustomisasi tampilan brand aplikasi Anda">
      <div className="space-y-6">
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
                <Image className="h-5 w-5" />
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

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Perubahan
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset ke Default
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
