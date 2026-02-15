
# Perbaikan dan Fitur Baru - Tahap 1

Karena permintaan sangat banyak, implementasi dibagi menjadi beberapa tahap. Tahap 1 ini fokus pada perbaikan yang paling kritis dan sering digunakan.

## Fitur yang Akan Dikerjakan di Tahap 1

### 1. Badge Halal di Toko dan Produk
Saat ini halal badge sudah muncul di halaman detail produk dan profil toko, tapi belum konsisten di semua tempat. Perbaikan:
- Tambah badge halal di `ProductCard` (card produk di listing/search)
- Pastikan badge halal tampil di profil toko (MerchantProfilePage) -- sudah ada, perlu diperbaiki tampilannya
- Tambah info sertifikat halal di profil toko (tampilkan link/preview sertifikat jika `halal_certificate_url` ada)

### 2. Custom Store Link (Slug Toko)
Setiap toko bisa diakses via URL `site.com/namatoko`:
- Tambah kolom `slug` di tabel `merchants` (unique, default dari nama toko yang di-slugify)
- Tambah route baru `/:slug` di App.tsx yang resolve ke MerchantProfilePage
- Di MerchantSettingsPage, tambah input untuk edit slug toko
- Slug harus unik dan hanya boleh huruf kecil, angka, dan strip

### 3. Checkout: Auto GPS + Alamat Cepat via Emsifa
- Di CheckoutAddressForm, otomatis trigger GPS saat komponen mount (bukan menunggu user klik "Lokasi Saya")
- Pastikan AddressSelector di checkout menggunakan Emsifa API yang sudah diperbaiki sebelumnya (sudah pakai addressApi.ts yang sama)

### 4. Penugasan Kurir di Detail Pesanan Merchant
Di OrderStatusManager, saat merchant klik "Kirim Pesanan" (status PROCESSED -> SENT):
- Tampilkan dialog pilihan: "Antar Sendiri (Kurir Toko)" atau "Tugaskan ke Kurir Desa"
- Jika pilih Kurir Desa, tampilkan dropdown kurir yang tersedia di desa tersebut
- Update `courier_id` pada order

## Detail Teknis

### Database Migration

```sql
-- Tambah kolom slug ke merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Index untuk pencarian slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug) WHERE slug IS NOT NULL;

-- Function untuk generate slug dari nama
CREATE OR REPLACE FUNCTION generate_merchant_slug(merchant_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(merchant_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM merchants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$;

-- Set slug untuk merchant yang sudah ada
UPDATE merchants SET slug = generate_merchant_slug(name) WHERE slug IS NULL;
```

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/components/ProductCard.tsx` | Tambah badge halal (query halal_status dari merchant) |
| `src/pages/MerchantProfilePage.tsx` | Tambah section sertifikat halal, support resolve by slug |
| `src/App.tsx` | Tambah route `/:slug` untuk store link |
| `src/pages/merchant/MerchantSettingsPage.tsx` | Tambah input edit slug toko |
| `src/components/checkout/LocationPicker.tsx` | Auto-trigger GPS on mount |
| `src/components/merchant/OrderStatusManager.tsx` | Tambah dialog pilih kurir (toko/desa) saat kirim pesanan |

### Fitur yang Ditunda ke Tahap 2
- Chat penjual-pembeli (perlu tabel baru `messages`, realtime subscription, auto-delete cron)
- Statistik pengunjung yang lebih lengkap (perlu tracking page views, grafik trend)
- Fitur share link toko (tombol share + copy link)

### Alur Custom Store Link

```text
User buka site.com/kedai-maju
  -> App.tsx cek route /:slug
  -> Query merchants WHERE slug = 'kedai-maju'
  -> Jika ditemukan, render MerchantProfilePage dengan merchant ID
  -> Jika tidak, render NotFound

Merchant bisa edit slug di Settings:
  -> Input slug, validasi format (lowercase, alphanumeric, dash)
  -> Cek ketersediaan via query
  -> Update ke database
```

### Alur Penugasan Kurir

```text
Merchant klik "Kirim Pesanan" pada order PROCESSED
  -> Dialog muncul: pilih metode pengiriman
  -> Opsi 1: "Antar Sendiri" -> status = SENT, courier_id = null
  -> Opsi 2: "Tugaskan Kurir Desa" -> tampilkan dropdown kurir aktif di village_id yang sama
  -> Pilih kurir -> status = SENT, courier_id = selected_courier_id
```
