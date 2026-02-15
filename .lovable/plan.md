
# Rencana Pengembangan Tahap 4: Peningkatan Pembeli, Pedagang & Verifikator

## Ringkasan

Tahap ini fokus pada peningkatan pengalaman pengguna di ketiga peran utama: pembeli mendapat fitur belanja yang lebih nyaman, pedagang mendapat alat manajemen yang lebih lengkap, dan verifikator mendapat kontrol dan visibilitas yang lebih baik.

---

## A. Peningkatan Pengalaman Pembeli

### 1. Halaman Riwayat Ulasan Saya
Saat ini pembeli hanya bisa menulis ulasan, tapi tidak bisa melihat semua ulasan yang pernah ditulis.

- Buat halaman baru `/reviews/mine` yang menampilkan semua ulasan pembeli
- Tampilkan: foto produk, rating bintang, teks ulasan, tanggal, dan balasan merchant (jika ada)
- Tambah menu "Ulasan Saya" di halaman Akun

### 2. Pesan Ulang (Reorder)
Pembeli sering memesan produk yang sama berulang kali. Fitur ini mempercepat proses:

- Di halaman Pesanan, tambah tombol "Pesan Lagi" pada pesanan berstatus DONE
- Klik tombol langsung memasukkan semua item pesanan ke keranjang (cek stok terlebih dahulu)
- Tampilkan toast jika ada produk yang sudah tidak tersedia

### 3. Detail Pesanan yang Lebih Lengkap
Saat ini card pesanan menampilkan info minimal. Perbaikan:

- Tambah dialog detail pesanan (OrderDetailsDialog) saat card diklik
- Tampilkan: daftar item pesanan, alamat pengiriman, metode pembayaran, timeline status, dan info kurir
- Tampilkan QR code / nomor resi untuk pesanan yang sedang dikirim

### 4. Notifikasi Badge di Bottom Nav
Tampilkan badge notifikasi unread di ikon Pesanan dan Akun di bottom navigation:

- Query `notifications` yang belum dibaca
- Tampilkan badge merah di tab "Pesanan" jika ada pesanan aktif
- Tampilkan badge di tab "Akun" jika ada notifikasi unread

---

## B. Peningkatan Dashboard Pedagang

### 1. Ringkasan Keuangan Harian
Dashboard merchant saat ini menampilkan grafik 14 hari tapi tidak ada ringkasan cepat hari ini:

- Tambah card "Pendapatan Hari Ini" dengan jumlah order dan total omzet hari ini
- Tambah perbandingan dengan kemarin (naik/turun berapa persen)
- Tampilkan jumlah pesanan baru yang belum diproses

### 2. Ekspor Laporan Penjualan
Merchant perlu rekap untuk pembukuan:

- Tambah tombol "Unduh Laporan" di halaman Analitik
- Generate PDF/CSV dengan data: tanggal, produk terjual, pendapatan, ongkir, refund
- Filter berdasarkan rentang tanggal (minggu ini, bulan ini, custom)

### 3. Notifikasi Stok Rendah Otomatis
Saat ini StockAlerts hanya tampil di dashboard, tapi tidak ada notifikasi proaktif:

- Saat stok produk di bawah ambang batas (misal 5), kirim notifikasi in-app ke merchant
- Tampilkan badge stok rendah di sidebar menu "Produk"
- Merchant bisa set ambang batas stok per produk di halaman edit produk

### 4. Quick Action Pesanan
Merchant sering bolak-balik halaman. Perbaikan:

- Di dashboard, tambah card "Pesanan Menunggu" dengan tombol aksi langsung (Terima/Tolak)
- Swipe-to-action pada daftar pesanan di mobile
- Sound notification saat pesanan baru masuk (sudah ada, pastikan berfungsi)

---

## C. Peningkatan Dashboard Verifikator

### 1. Dashboard Overview yang Lebih Informatif
Dashboard verifikator saat ini terlalu padat. Perbaikan:

- Buat layout dashboard 2 kolom: statistik di kiri, aktivitas terbaru di kanan
- Tambah grafik tren bulanan iuran kas (koleksi per bulan dalam 6 bulan terakhir)
- Tambah daftar "Merchant Bermasalah" (yang menunggak > 2 bulan)

### 2. Profil Merchant Detail
Verifikator perlu melihat detail merchant lebih lengkap:

- Dari halaman Daftar Merchant, klik untuk buka detail merchant
- Tampilkan: info toko, produk, riwayat pesanan, status kuota, riwayat iuran kas
- Verifikator bisa langsung buat tagihan dari halaman detail ini

### 3. Sistem Pengumuman ke Kelompok
Verifikator perlu berkomunikasi dengan semua merchant dalam kelompok:

- Tambah fitur "Kirim Pengumuman" di dashboard
- Pengumuman dikirim sebagai notifikasi ke semua merchant dalam kelompok dagang
- Riwayat pengumuman tersimpan dan bisa dilihat kembali

### 4. Rekap Kinerja Verifikator
Untuk transparansi dan evaluasi:

- Tampilkan statistik: jumlah merchant aktif, tingkat kepatuhan iuran, total komisi diterima
- Grafik tren performa (merchant baru per bulan, iuran terkumpul per bulan)
- Export rekap ke PDF untuk pelaporan

---

## Detail Teknis

### Database Migration

```sql
-- Tabel pengumuman verifikator ke kelompok
CREATE TABLE IF NOT EXISTS group_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES trade_groups(id) ON DELETE CASCADE,
  verifikator_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifikator can manage own announcements"
  ON group_announcements FOR ALL
  USING (verifikator_id = auth.uid());

CREATE POLICY "Group members can read announcements"
  ON group_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN merchants m ON m.id = gm.merchant_id
      WHERE gm.group_id = group_announcements.group_id
      AND m.user_id = auth.uid()
    )
  );

-- Ambang batas stok per produk
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;
```

### File Baru

| File | Deskripsi |
|------|-----------|
| `src/pages/buyer/MyReviewsPage.tsx` | Halaman daftar ulasan pembeli |
| `src/components/order/OrderDetailSheet.tsx` | Bottom sheet detail pesanan lengkap |
| `src/components/merchant/DailySummaryCard.tsx` | Card ringkasan pendapatan harian |
| `src/components/merchant/SalesExport.tsx` | Komponen ekspor laporan penjualan |
| `src/components/verifikator/GroupAnnouncementDialog.tsx` | Dialog kirim pengumuman ke kelompok |
| `src/components/verifikator/MerchantDetailSheet.tsx` | Detail merchant untuk verifikator |

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/pages/AccountPage.tsx` | Tambah menu "Ulasan Saya", badge notifikasi |
| `src/pages/OrdersPage.tsx` | Tambah tombol "Pesan Lagi", klik buka detail sheet |
| `src/components/layout/BottomNav.tsx` | Tambah badge notifikasi unread & pesanan aktif |
| `src/pages/merchant/MerchantDashboardPage.tsx` | Tambah DailySummaryCard, quick action pesanan |
| `src/pages/merchant/MerchantAnalyticsPage.tsx` | Tambah tombol ekspor laporan |
| `src/pages/merchant/MerchantProductDetailPage.tsx` | Tambah input ambang batas stok rendah |
| `src/pages/verifikator/VerifikatorDashboardPage.tsx` | Layout baru 2 kolom, grafik tren, daftar merchant bermasalah, tombol pengumuman |
| `src/pages/verifikator/VerifikatorMerchantsPage.tsx` | Klik merchant buka detail sheet |
| `src/components/verifikator/VerifikatorSidebar.tsx` | (tidak perlu berubah, sudah lengkap) |
| `src/components/merchant/MerchantSidebar.tsx` | Badge stok rendah di menu Produk |
| `src/App.tsx` | Tambah route `/reviews/mine` |

### Ringkasan Perubahan

| Kategori | Jumlah |
|----------|--------|
| File baru | 6 |
| File diubah | 11 |
| Migrasi database | 1 |
| Total | 18 perubahan |

### Prioritas Implementasi

1. **Tinggi**: Detail pesanan pembeli, badge notifikasi, ringkasan harian merchant
2. **Sedang**: Pesan ulang, ekspor laporan, pengumuman kelompok
3. **Rendah**: Grafik tren verifikator, detail merchant verifikator, ambang stok

