import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProofOfDeliveryProps {
  orderId: string;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProofOfDelivery({ orderId, onSuccess, open, onOpenChange }: ProofOfDeliveryProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File terlalu besar',
          description: 'Maksimal ukuran file adalah 5MB',
          variant: 'destructive',
        });
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast({
        title: 'Foto diperlukan',
        description: 'Harap ambil foto bukti pengiriman',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload image to storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;
      const filePath = `pod/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pod-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pod-images')
        .getPublicUrl(filePath);

      // Update order with POD info and status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          pod_image_url: urlData.publicUrl,
          pod_notes: notes || null,
          pod_uploaded_at: new Date().toISOString(),
          status: 'DELIVERED',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      toast({ title: 'Pengiriman selesai!', description: 'Bukti pengiriman berhasil diunggah' });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading POD:', error);
      toast({
        title: 'Gagal mengunggah',
        description: 'Terjadi kesalahan saat mengunggah bukti pengiriman',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Bukti Pengiriman (POD)
          </DialogTitle>
          <DialogDescription>
            Unggah foto bukti pengiriman untuk menyelesaikan pesanan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Foto Bukti Pengiriman *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Ambil Foto</p>
                <p className="text-xs text-muted-foreground">atau pilih dari galeri</p>
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Catatan (opsional)</Label>
            <Textarea
              placeholder="Contoh: Diterima oleh Pak Budi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!image || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Selesaikan Pengiriman
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
