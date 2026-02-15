
# Fix Loading Alamat: Ganti API Utama ke Emsifa (CDN Gratis + Tanpa CORS)

## Akar Masalah Saat Ini

Semua 4 strategi fetch gagal atau lambat:

| Strategi | Status | Alasan |
|----------|--------|--------|
| Direct ke wilayah.id | Gagal | CORS diblokir browser |
| Edge function wilayah-proxy | Gagal | Tidak terdeploy (404 Not Found) |
| allorigins.win proxy | Tidak stabil | Layanan gratis sering down |
| corsproxy.io proxy | Tidak stabil | Layanan gratis sering down |

## Solusi: Tambah API Emsifa sebagai Sumber Utama

Ditemukan API alternatif gratis yang **langsung bisa diakses dari browser tanpa CORS**:

**Emsifa API** (`https://www.emsifa.com/api-wilayah-indonesia/api/`)

Kelebihan:
- Hosted di GitHub Pages, CORS sudah diizinkan
- Format ID sama dengan wilayah.id (11, 3201, 3273050, dst)
- Gratis, stabil, data lengkap sampai kelurahan
- Response cepat (static JSON)

Endpoint:
- Provinsi: `/provinces.json`
- Kabupaten: `/regencies/{provinceId}.json`
- Kecamatan: `/districts/{regencyId}.json`
- Kelurahan: `/villages/{districtId}.json`

Response format: `[{id, name}, ...]` -- tinggal map `id` ke `code`

## Strategi Baru (5-way Parallel Race)

```text
Promise.any([
  1. Emsifa API (UTAMA - langsung dari browser, tanpa CORS)
  2. Edge function wilayah-proxy (deploy ulang)
  3. Direct fetch wilayah.id (tetap dicoba)
  4. CORS proxy allorigins.win
  5. CORS proxy corsproxy.io
])
-> Yang pertama berhasil langsung dipakai
-> Timeout 10 detik
```

Dengan Emsifa sebagai sumber utama yang langsung bisa diakses browser, dropdown akan terisi dalam 1-2 detik.

## Detail Teknis

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/lib/addressApi.ts` | Tambah `fetchViaEmsifa()`, jadikan strategi pertama dalam race, normalisasi nama (Title Case) |
| `supabase/functions/wilayah-proxy/index.ts` | Deploy ulang edge function (kode sudah benar) |

### Perubahan addressApi.ts

1. Tambah fungsi baru `fetchViaEmsifa(type, code, signal)`:
   - URL: `https://www.emsifa.com/api-wilayah-indonesia/api/{type}/{code}.json`
   - Map response `{id, name}` ke `{code, name}` agar kompatibel
   - Normalisasi nama dari HURUF BESAR ke Title Case (contoh: "JAWA BARAT" -> "Jawa Barat")

2. Tambahkan ke array parallel race sebagai item pertama (prioritas tertinggi karena paling reliable)

3. Normalisasi helper function `toTitleCase()` untuk mengubah nama dari UPPERCASE ke format yang lebih rapi

### Perubahan Edge Function

Deploy ulang `wilayah-proxy` (kode sudah benar, hanya belum terdeploy). Ini menjadi backup kedua setelah Emsifa.

### Kompatibilitas

- Format ID Emsifa sama dengan wilayah.id (11, 3201, 3273050, 3273050001)
- Interface `Region {code, name}` tetap sama
- Semua komponen yang pakai AddressDropdowns tidak perlu diubah
- Cache localStorage tetap bekerja normal
