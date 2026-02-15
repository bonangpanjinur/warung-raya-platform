

# Analisis & Rencana Pengembangan Tahap 5: Pembeli, Pedagang & Super Admin

## Hasil Analisis Kekurangan

### A. PEMBELI -- Area yang Perlu Ditingkatkan

#### 1. Halaman Produk: Tidak Ada Galeri Multi-Foto
Saat ini `ProductDetail.tsx` hanya menampilkan satu gambar. Tabel `products` memiliki `image_url` saja. Padahal sudah ada komponen `MultipleImageUpload` di sisi merchant tapi belum terpakai untuk menampilkan di sisi pembeli. Perlu carousel gambar produk.

#### 2. Tidak Ada Fitur Pencarian di Halaman Keranjang
`CartPage.tsx` tidak mengelompokkan item per merchant dengan jelas dan tidak ada catatan per item. Juga ongkir estimasi hardcoded Rp5.000 yang berbeda dari kalkulasi checkout sebenarnya -- bisa membingungkan pembeli.

#### 3. Halaman Bantuan Tidak Berfungsi
Di `AccountPage.tsx`, tombol "Bantuan" (baris 337) tidak mengarah ke mana pun (`onClick` tidak ada). Perlu halaman FAQ atau kontak bantuan.

#### 4. Pengaturan Profil Foto Tidak Ada
Tidak ada fitur upload foto profil di `AccountPage` atau `ProfileEditor`. Padahal kolom `avatar_url` sudah ada di tabel `profiles` dan bucket `profile-images` sudah tersedia.

#### 5. Riwayat Pencarian dan Produk Terakhir Dilihat
`useSearchHistory` sudah ada tapi belum ada halaman "Terakhir Dilihat" untuk pembeli. Fitur ini meningkatkan engagement.

#### 6. Tidak Ada Estimasi Waktu Pengiriman
Di checkout dan order detail, tidak ada ETA meski sudah ada `src/lib/etaCalculation.ts`. Perlu integrasi.

---

### B. PEDAGANG (MERCHANT) -- Area yang Perlu Ditingkatkan

#### 1. Tidak Ada Multi-Foto Produk di Editor
`MerchantProductDetailPage` sudah ada tapi hanya satu gambar. Komponen `MultipleImageUpload` sudah dibuat tapi belum diintegrasikan. Perlu koneksi ke tabel `product_images` (jika ada) atau kolom array.

#### 2. Dashboard: Pesanan Menunggu Tanpa Quick Action
Di `MerchantDashboardPage.tsx`, tab "Pesanan" mengarah ke `OrderStatusManager` yang lengkap, tapi tidak ada quick action card di overview (terima/tolak langsung tanpa pindah tab).

#### 3. Tidak Ada Notifikasi Sound untuk Pesanan Baru
Tidak ditemukan implementasi sound notification di kode. Perlu audio alert saat pesanan baru masuk via realtime subscription.

#### 4. Chat Merchant-Pembeli Terbatas
`MerchantChatPage` ada tapi tidak ada link dari sisi pembeli ke chat. Komunikasi buyer-merchant harus 2 arah.

#### 5. Tidak Ada Analitik Pengunjung yang Terlihat
`MerchantVisitorStatsPage` ada tapi tidak jelas apakah sudah terintegrasi dengan `pageViewTracker`. Perlu verifikasi dan peningkatan dashboard.

---

### C. SUPER ADMIN -- Area yang Perlu Ditingkatkan

#### 1. Tidak Ada Dashboard Ringkasan Keuangan Platform
`AdminFinancePage` ada tapi fee platform hardcoded (5%, 80%). Seharusnya mengambil dari `app_settings` yang sudah dikonfigurasi di `AdminSettingsPage`.

#### 2. Manajemen Pengguna: Tidak Bisa Edit Role Langsung
`AdminUsersPage` bisa block/unblock dan tambah user, tapi tidak bisa edit role user yang sudah ada (misal: promote buyer ke merchant, hapus role). Ini kritis.

#### 3. Tidak Ada Monitoring Kesehatan Sistem
Tidak ada dashboard yang menampilkan: jumlah error, response time, edge function failures, storage usage. Admin harus tahu jika ada masalah.

#### 4. AdminSettingsPage Tidak Menggunakan AdminLayout
`AdminSettingsPage` (baris 102) menggunakan layout manual dengan `AdminSidebar` langsung, bukan `AdminLayout` seperti halaman lain. Ini menyebabkan sidebar tidak konsisten (tidak ada badge pending, tidak ada tombol hamburger di mobile).

#### 5. Laporan Tidak Bisa Custom Date Range
`AdminReportsPage` dan `AdminFinancePage` hanya preset (7 hari, 30 hari, bulan ini/lalu). Tidak ada date picker custom range.

#### 6. Tidak Ada Audit Trail yang Visible
`auditLog.ts` sudah mencatat aksi admin, tapi `AdminLogsPage` belum diperiksa apakah menampilkan log ini dengan baik.

#### 7. Export PDF di Laporan Keuangan Terbatas 50 Row
`AdminFinancePage` baris 201 membatasi `.slice(0, 50)` untuk export PDF. Untuk laporan resmi, ini tidak cukup.

---

## Rencana Implementasi

### Prioritas 1: Perbaikan Kritis

| No | Fitur | File | Kategori |
|----|-------|------|----------|
| 1 | Upload Foto Profil pembeli | `AccountPage.tsx`, `ProfileEditor.tsx` | Pembeli |
| 2 | Halaman Bantuan/FAQ | Buat `HelpPage.tsx`, update `AccountPage` | Pembeli |
| 3 | Edit Role User di Admin | `AdminUsersPage.tsx` | Admin |
| 4 | Fix AdminSettings pakai AdminLayout | `AdminSettingsPage.tsx` | Admin |
| 5 | Fee platform dari app_settings | `AdminFinancePage.tsx` | Admin |

### Prioritas 2: Peningkatan UX

| No | Fitur | File | Kategori |
|----|-------|------|----------|
| 6 | Perbaiki estimasi ongkir di CartPage | `CartPage.tsx` | Pembeli |
| 7 | Integrasi ETA pengiriman | `OrderDetailSheet.tsx`, `CheckoutPage.tsx` | Pembeli |
| 8 | Quick action pesanan di merchant dashboard | `MerchantDashboardPage.tsx` | Pedagang |
| 9 | Sound notification pesanan baru | `MerchantDashboardPage.tsx` | Pedagang |
| 10 | Custom date range picker di laporan | `AdminReportsPage.tsx`, `AdminFinancePage.tsx` | Admin |

### Prioritas 3: Fitur Baru

| No | Fitur | File | Kategori |
|----|-------|------|----------|
| 11 | Halaman "Terakhir Dilihat" | Buat `RecentlyViewedPage.tsx` | Pembeli |
| 12 | Chat 2 arah buyer-merchant dari OrderDetail | `OrderDetailSheet.tsx` | Pembeli |
| 13 | Galeri multi-foto produk (buyer view) | `ProductDetail.tsx` | Pembeli |
| 14 | System health monitoring | Buat `AdminSystemHealthPage.tsx` | Admin |
| 15 | Export PDF tanpa batas 50 row | `AdminFinancePage.tsx` | Admin |

---

## Detail Teknis Perubahan

### 1. Upload Foto Profil
- Gunakan bucket `profile-images` yang sudah ada
- Tambah komponen avatar upload di `ProfileEditor.tsx`
- Update `profiles.avatar_url` saat upload berhasil
- Tampilkan di `AccountPage` (ganti ikon User dengan foto)

### 2. Halaman Bantuan
- Buat `src/pages/HelpPage.tsx` dengan FAQ accordion
- Tambah kontak WhatsApp/email admin (ambil dari `app_settings`)
- Route `/help`, link dari `AccountPage.tsx`

### 3. Edit Role User
- Di `AdminUsersPage.tsx`, tambah dialog "Kelola Role"
- Checkbox per role (admin, merchant, courier, verifikator, admin_desa, buyer)
- Insert/delete dari tabel `user_roles`

### 4. Fix AdminSettingsPage Layout
- Ganti layout manual menjadi `<AdminLayout title="Pengaturan" subtitle="Konfigurasi...">`
- Hapus inline `<AdminSidebar />` dan wrapper div
- Otomatis dapat: responsive sidebar, hamburger mobile, badge pending, refresh cache

### 5. Fee Platform dari app_settings
- Baca `platform_fee` dan `courier_commission` dari `app_settings` via query
- Ganti hardcoded `PLATFORM_FEE_PERCENT = 5` dan `COURIER_FEE_PERCENT = 80`

### 6. Perbaiki CartPage Ongkir
- Hapus hardcoded `shippingCost = 5000`
- Tampilkan "Ongkir dihitung saat checkout" sebagai teks
- Atau hitung berdasarkan `shipping_base_fee` dari `app_settings`

### 7. Quick Action Pesanan Merchant
- Di tab "overview" dashboard merchant, tambah card pesanan baru
- Tampilkan 3-5 pesanan terbaru status NEW
- Tombol "Terima" dan "Tolak" langsung di card

### 8. Sound Notification
- Tambah audio element di `MerchantDashboardPage`
- Play sound saat realtime event `INSERT` pada `orders` untuk merchant tersebut
- Gunakan Web Audio API atau `<audio>` tag sederhana

### 9. Custom Date Range
- Tambah opsi "Custom" di select period
- Munculkan date picker (sudah ada `react-day-picker`)
- Implementasi di `AdminReportsPage` dan `AdminFinancePage`

### 10. Hapus Limit 50 Row di Export
- Hapus `.slice(0, 50)` dari export PDF di `AdminFinancePage`
- Tambah pagination di autoTable jika data > 100 row

---

## Database Changes

Tidak ada perubahan database diperlukan. Semua kolom dan tabel sudah tersedia:
- `profiles.avatar_url` -- sudah ada
- `product_images` -- perlu dicek, mungkin belum ada (untuk multi-foto, tahap selanjutnya)
- `app_settings` -- sudah ada untuk fee settings

## Ringkasan

| Kategori | Jumlah Perubahan |
|----------|-----------------|
| File baru | 3 (HelpPage, RecentlyViewedPage, AdminSystemHealthPage) |
| File diubah | 12 |
| Migrasi database | 0 |
| Total | 15 perubahan |

Semua perubahan ini meningkatkan fungsionalitas yang sudah ada tanpa menambah kompleksitas database baru.

