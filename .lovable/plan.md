
# Rencana Perbaikan Menyeluruh: Pendaftaran UMKM, Lokasi, dan Manajemen User

## Ringkasan 5 Masalah

| No | Masalah | Akar Penyebab |
|----|---------|---------------|
| 1 | Kode referral muncul 2x di form pendaftaran UMKM | Ada 2 input terpisah untuk hal yang sama (baris 396-433 dan baris 448-461) |
| 2 | Dropdown lokasi sering gagal/lambat di jaringan lemah | Timeout terlalu pendek (5 detik), tidak ada retry, dan tidak ada loading indicator yang jelas |
| 3 | Titik lokasi toko harus otomatis terisi | Saat ini hanya manual klik peta, tidak ada auto-detect GPS saat halaman dibuka |
| 4 | User baru tidak tercatat di manajemen user | **Trigger `handle_new_user` tidak terpasang ke `auth.users`** -- fungsi ada tapi trigger-nya hilang, jadi profile dan role tidak dibuat otomatis |
| 5 | Toko yang didaftarkan dari akun user harus otomatis terhubung | Insert ke `merchants` tidak menyertakan `user_id = auth.uid()` |

---

## Fase 1: Fix Trigger User Baru (Masalah #4) -- PRIORITAS TERTINGGI

**Ini adalah bug paling kritis.** Fungsi `handle_new_user()` sudah ada di database tapi tidak ada trigger yang menghubungkannya ke tabel `auth.users`. Akibatnya:
- Profil tidak dibuat otomatis saat signup
- Role `buyer` tidak ditambahkan
- User tidak muncul di halaman admin

**SQL Migration:**
```text
-- Pasang trigger yang hilang
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**File:** SQL Migration baru

---

## Fase 2: Hapus Redundansi Kode Referral (Masalah #1)

Di `RegisterMerchantPage.tsx` ada 2 tempat input kode referral/verifikator:

1. **Section "Kode Referral"** (baris 396-433) -- input lengkap dengan validasi, status badge
2. **Section "Informasi Usaha"** (baris 448-461) -- input kedua berlabel "Kode Verifikator" yang mengarah ke state yang sama

Keduanya menggunakan `referralCode` state yang sama, jadi sebenarnya redundan.

**Solusi:** Hapus input kedua (baris 448-461) karena section pertama sudah lengkap dengan validasi dan feedback visual.

**File:** `src/pages/RegisterMerchantPage.tsx`

---

## Fase 3: Perbaikan Dropdown Lokasi untuk Jaringan Lemah (Masalah #2)

Masalah saat ini di `addressApi.ts`:
- Timeout direct fetch hanya 5 detik, edge function 8 detik
- Jika semua gagal, user tidak tahu harus apa (hanya error di console)
- Tidak ada retry otomatis

**Perbaikan di `src/lib/addressApi.ts`:**
1. Naikkan timeout: direct 10 detik, edge function 15 detik, CORS proxy 15 detik
2. Tambah retry otomatis (1x retry per strategi sebelum pindah ke fallback berikutnya)
3. Jika semua gagal, return array kosong dengan pesan yang jelas, bukan throw error

**Perbaikan di `src/pages/RegisterMerchantPage.tsx`:**
1. Tambah tombol "Coba Lagi" jika dropdown gagal dimuat
2. Tampilkan skeleton/spinner yang lebih jelas saat loading
3. Tambah pesan "Koneksi lambat, mohon tunggu..." jika loading lebih dari 3 detik

**File:** `src/lib/addressApi.ts`, `src/pages/RegisterMerchantPage.tsx`

---

## Fase 4: Auto-detect Lokasi GPS untuk Titik Toko (Masalah #3)

Di `MerchantLocationPicker.tsx`, GPS hanya aktif saat user menekan tombol "Lokasi Saya".

**Perbaikan:**
1. Saat komponen pertama kali dimuat dan belum ada `value`, otomatis panggil `navigator.geolocation.getCurrentPosition`
2. Set lokasi dari GPS sebagai nilai awal
3. User masih bisa klik peta untuk menggeser titik secara manual
4. Tambah fallback: jika GPS ditolak/gagal, tetap tampilkan peta di posisi default (Tasikmalaya)

**File:** `src/components/merchant/MerchantLocationPicker.tsx`

---

## Fase 5: Otomatis Hubungkan Merchant ke Akun User (Masalah #5)

Saat ini di `RegisterMerchantPage.tsx` baris 318, ada komentar:
```
// user_id is automatically handled by Supabase Trigger
```
Tapi **tidak ada trigger yang melakukan ini**. `user_id` tidak pernah dikirim saat insert.

**Perbaikan:** Tambahkan `user_id: user.id` ke objek insert di `RegisterMerchantPage.tsx`:
```text
const { error } = await supabase.from('merchants').insert({
  user_id: user.id,  // <-- tambahkan ini
  name: data.name.trim(),
  ...
});
```

**File:** `src/pages/RegisterMerchantPage.tsx`

---

## Urutan Implementasi

1. SQL Migration -- pasang trigger `on_auth_user_created` (Fase 1)
2. `src/pages/RegisterMerchantPage.tsx` -- hapus redundansi referral + tambah `user_id` + perbaiki UX loading (Fase 2, 3, 5)
3. `src/lib/addressApi.ts` -- perbaiki timeout dan retry (Fase 3)
4. `src/components/merchant/MerchantLocationPicker.tsx` -- auto GPS (Fase 4)

---

## Detail Teknis

### File yang Diubah

| File | Perubahan |
|------|-----------|
| SQL Migration (baru) | Pasang trigger `on_auth_user_created` ke `auth.users` |
| `src/pages/RegisterMerchantPage.tsx` | Hapus input referral duplikat (baris 448-461), tambah `user_id: user.id` di insert, tambah retry button untuk dropdown lokasi |
| `src/lib/addressApi.ts` | Naikkan timeout (10s/15s), tambah retry per strategi, error handling lebih baik |
| `src/components/merchant/MerchantLocationPicker.tsx` | Auto-detect GPS saat mount jika belum ada value |

### Dampak

- User baru langsung muncul di manajemen pengguna admin
- Form pendaftaran UMKM lebih bersih tanpa duplikasi
- Dropdown alamat lebih tahan di jaringan lemah
- Titik toko otomatis terisi dari GPS
- Merchant otomatis terhubung ke akun pendaftar
