

# Rencana Perbaikan: tsconfig.json + UI/UX OrdersPage

## Problem 1: Halaman Blank (Build Error)

File `tsconfig.json` diubah pada edit terakhir dan sekarang menyebabkan error build:
```
tsconfig.json: error TS6306: Referenced project 'tsconfig.node.json' must have setting "composite": true.
tsconfig.json: error TS6310: Referenced project 'tsconfig.node.json' may not disable emit.
```

Ini menyebabkan **seluruh aplikasi blank/tidak bisa diakses**.

### Solusi
Kembalikan `tsconfig.json` ke format project references yang benar (seperti sebelumnya):

```text
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

Ini mengembalikan referensi ke `tsconfig.app.json` (yang hilang) dan menghilangkan setting `strict`, `noEmit`, dll yang konflik.

---

## Problem 2: UI/UX OrdersPage

Setelah build diperbaiki, halaman Orders perlu peningkatan visual:

### Perbaikan yang akan dilakukan:

1. **Header lebih menarik** -- Ganti `PageHeader` sederhana dengan header bergradien hijau brand yang menampilkan ikon dan jumlah pesanan aktif

2. **Tab filter lebih jelas** -- Tambahkan jumlah pesanan per tab (badge count) agar pembeli tahu ada berapa pesanan di setiap kategori

3. **Card pesanan lebih informatif**:
   - Tampilkan tanggal pesanan (format: "12 Feb 2026")
   - Tampilkan nomor pesanan singkat (8 karakter pertama dari ID)
   - Gambar produk lebih besar (20x20 dari 16x16)
   - Tambahkan divider visual antara info toko dan detail produk

4. **Status dengan ikon** -- Setiap status badge ditambahkan ikon kecil (Clock untuk pending, Truck untuk shipped, dll)

5. **Tombol aksi kontekstual** -- Selain "Bayar Sekarang" untuk pending, tambahkan:
   - "Lacak Pesanan" untuk status shipped/out_for_delivery
   - "Beri Ulasan" untuk status completed
   - "Pesan Lagi" untuk status completed/cancelled

6. **Empty state lebih menarik** -- Ilustrasi lebih besar dengan animasi halus dan teks yang lebih ramah

7. **Pull-to-refresh indicator** -- Tambahkan visual feedback saat refresh data

---

## File yang Diubah

| File | Perubahan |
|------|-----------|
| `tsconfig.json` | Kembalikan ke format project references yang benar |
| `src/pages/OrdersPage.tsx` | Redesign UI/UX lengkap dengan semua perbaikan di atas |

