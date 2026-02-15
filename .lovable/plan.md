
# Perbaikan: Percepatan Loading Dropdown Alamat + Auto-save Draft Form

## Masalah Utama

Dropdown alamat (Kecamatan, Kelurahan) sering tidak muncul atau sangat lama karena:
1. **Fetch sequential** -- direct gagal (10s) -> retry (10s) -> edge function (15s) -> retry (15s) -> CORS proxy (15s) -> retry (15s) = **total 80 detik** worst case sebelum menyerah
2. **Tidak ada feedback error yang actionable** -- user hanya melihat "Pilih kecamatan" tanpa tahu apakah sedang loading atau gagal
3. **Data hilang saat keluar halaman** -- tidak ada mekanisme simpan draft

---

## Solusi 1: Parallel Race untuk Fetch Alamat

Ubah `fetchWithFallbacks` di `src/lib/addressApi.ts` dari sequential menjadi **parallel race** menggunakan `Promise.any()`:

```text
SEBELUM (sequential, worst case 80s):
  direct(10s) -> retry(10s) -> edge(15s) -> retry(15s) -> cors(15s) -> retry(15s)

SESUDAH (parallel, worst case 15s):
  Promise.any([direct(10s), edge(15s), cors(15s)])
  -> Yang pertama berhasil langsung dipakai
  -> Sisanya di-cancel via AbortController
```

**File:** `src/lib/addressApi.ts`
- Buat fungsi `fetchParallelRace(type, code)` yang menjalankan ketiga strategi bersamaan
- Gunakan shared `AbortController` agar request yang kalap bisa dibatalkan
- Tetap ada fallback ke `STATIC_PROVINCES` jika semua gagal untuk provinsi

---

## Solusi 2: Tombol Retry + Error State di Form

Di `src/pages/RegisterMerchantPage.tsx`, tambahkan:
- State `errorLoadingDistricts` dan `errorLoadingSubdistricts`
- Jika fetch gagal (return array kosong), tampilkan pesan error + tombol "Coba Lagi"
- Tombol retry memanggil ulang fetch tanpa perlu mengganti pilihan parent

---

## Solusi 3: Auto-save Draft Form ke localStorage

Di `src/pages/RegisterMerchantPage.tsx`:
- Simpan semua state form ke `localStorage` (key: `merchant_registration_draft`) dengan debounce 500ms
- Saat mount, baca draft dan restore semua field + trigger load chain dropdown
- Hapus draft setelah submit berhasil
- Tampilkan banner kecil "Draft tersimpan" + tombol "Hapus Draft"

**Data yang disimpan:**
- Nama, kategori, deskripsi, phone, jam buka/tutup
- Kode & nama provinsi, kota, kecamatan, kelurahan
- Koordinat lokasi, kode referral
- Status halal & URL sertifikat

---

## Detail Teknis

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/lib/addressApi.ts` | Ganti `fetchWithFallbacks` ke parallel race dengan `Promise.any()` + shared AbortController |
| `src/pages/RegisterMerchantPage.tsx` | Tambah auto-save draft, restore draft, error state + retry button untuk dropdown, banner draft |

### Implementasi Parallel Race (addressApi.ts)

Fungsi baru `fetchParallelRace`:
1. Buat 1 `AbortController` bersama
2. Jalankan `fetchDirect`, `fetchViaEdgeFunction`, `fetchViaCorsProxy` secara bersamaan via `Promise.any()`
3. Saat salah satu berhasil, abort sisanya
4. Jika semua gagal (`AggregateError`), return data statis atau array kosong

### Implementasi Draft (RegisterMerchantPage.tsx)

```text
DRAFT_KEY = 'merchant_registration_draft'

On mount:
  1. Baca draft dari localStorage
  2. Set semua state (selectedProvince, selectedCity, dll)
  3. Set form values via setValue()
  4. Trigger chain loading dropdown (provinsi -> kota -> kecamatan -> kelurahan)

On change (debounce 500ms):
  1. Kumpulkan semua state ke object
  2. Simpan ke localStorage

On submit success:
  1. localStorage.removeItem(DRAFT_KEY)
```

### Implementasi Retry Button

Untuk setiap dropdown yang gagal load:
- Deteksi jika fetch return array kosong (bukan karena belum dipilih parent)
- Tampilkan: "Gagal memuat data. [Coba Lagi]"
- Tombol retry memanggil fungsi fetch ulang dengan kode parent yang sama
