
# Perbaikan Loading Alamat - Status

## ✅ Selesai

1. **Parallel race dengan 4 strategi** - `addressApi.ts` sekarang menjalankan direct, edge function, allorigins.win, dan corsproxy.io secara bersamaan
2. **Timeout dikurangi** dari 15s ke 10s
3. **Error state + tombol Retry** di `AddressDropdowns.tsx` - user bisa retry tanpa reset form
4. **CORS headers diperbaiki** di `wilayah-proxy/index.ts`

## ⚠️ Catatan

Edge function `wilayah-proxy` sudah di-deploy tapi belum aktif di platform (404). Deploy berhasil tapi function_id belum terdaftar. Ini mungkin masalah propagasi platform yang akan resolve sendiri. Sementara itu, CORS proxy (allorigins.win + corsproxy.io) menjadi strategi utama.
