import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Users, Search, CheckCircle, Store, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

interface VerifikatorInfo {
  id: string;
  full_name: string | null;
  business_name: string | null;
  referral_code: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export const MerchantGroupCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [verifikator, setVerifikator] = useState<VerifikatorInfo | null>(null);
  const [currentVerifikator, setCurrentVerifikator] = useState<VerifikatorInfo | null>(null);

  useEffect(() => {
    if (user) {
      checkCurrentMembership();
    }
  }, [user]);

  const checkCurrentMembership = async () => {
    try {
      // Get current user's profile to find their verifikator_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('verifikator_id, referral_code')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // If they have a verifikator_id, fetch that verifikator's details
      if (profile?.verifikator_id) {
        const { data: verifikatorData, error: verifikatorError } = await supabase
          .from('profiles')
          .select('id, full_name, business_name, referral_code, phone, email, address')
          .eq('id', profile.verifikator_id)
          .single();

        if (verifikatorError) throw verifikatorError;
        
        console.log("Current verifikator found:", verifikatorData);
        setCurrentVerifikator(verifikatorData);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const searchVerifikator = async () => {
    if (!searchCode.trim()) {
      toast({
        title: "Kode kosong",
        description: "Mohon masukkan kode referal verifikator",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, referral_code, phone, email, address')
        .eq('referral_code', searchCode.toUpperCase())
        .eq('role', 'verifikator')
        .single();

      if (error) {
        toast({
          title: "Verifikator tidak ditemukan",
          description: "Pastikan kode referal yang anda masukkan benar",
          variant: "destructive",
        });
        setVerifikator(null);
      } else {
        setVerifikator(data);
      }
    } catch (error) {
      console.error('Error searching verifikator:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!verifikator || !user) return;

    setLoading(true);
    try {
      // Update merchant's profile with verifikator_id
      const { error } = await supabase
        .from('profiles')
        .update({ verifikator_id: verifikator.id })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Berhasil bergabung",
        description: `Anda telah bergabung dengan kelompok ${verifikator.business_name || verifikator.full_name}`,
      });
      
      setCurrentVerifikator(verifikator);
      setVerifikator(null);
      setSearchCode("");
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Gagal bergabung",
        description: "Terjadi kesalahan saat mencoba bergabung dengan kelompok",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // State 1: Sudah bergabung dengan verifikator
  if (currentVerifikator) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">Keanggotaan Kelompok Dagang</CardTitle>
          </div>
          <CardDescription>
            Anda terdaftar dalam kelompok dagang di bawah naungan verifikator ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Store className="h-6 w-6 text-green-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {currentVerifikator.business_name || "Nama Usaha Tidak Ada"}
                </h3>
                <p className="text-sm text-gray-500">Verifikator: {currentVerifikator.full_name}</p>
                <div className="pt-2 flex flex-col gap-1 text-sm text-gray-600">
                  <p><span className="font-medium">Kode Referal:</span> {currentVerifikator.referral_code}</p>
                  {currentVerifikator.phone && (
                    <p><span className="font-medium">Telp:</span> {currentVerifikator.phone}</p>
                  )}
                  {currentVerifikator.address && (
                    <p><span className="font-medium">Alamat:</span> {currentVerifikator.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Informasi</AlertTitle>
            <AlertDescription className="text-blue-700">
              Sebagai anggota, verifikator ini akan membantu memvalidasi produk dan transaksi Anda. Hubungi nomor di atas jika Anda memerlukan bantuan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // State 2: Belum bergabung (Form Pencarian)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gabung Kelompok Dagang
        </CardTitle>
        <CardDescription>
          Cari verifikator menggunakan kode referal untuk bergabung dengan kelompok dagang.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Masukkan Kode Referal (contoh: SU92BDXJ)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="uppercase"
          />
          <Button onClick={searchVerifikator} disabled={loading}>
            {loading ? "Mencari..." : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {verifikator && (
          <div className="bg-slate-50 p-4 rounded-lg border space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{verifikator.business_name || verifikator.full_name}</h4>
                <p className="text-sm text-muted-foreground">{verifikator.address || "Alamat tidak tersedia"}</p>
                <p className="text-xs text-muted-foreground mt-1">Kode: {verifikator.referral_code}</p>
              </div>
            </div>
            <Button className="w-full" onClick={joinGroup} disabled={loading}>
              Gabung dengan Kelompok Ini
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};