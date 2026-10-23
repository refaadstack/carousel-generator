# Brand Kit

Folder ini adalah sumber data brand untuk aplikasi. Setiap brand disimpan di satu folder
dengan nama sesuai `id` brand.

```
assets/brands/<brand-id>/
  brand.json
  logo.svg | logo.png | logo.webp
```

## Aturan

- `brand.json` wajib memiliki `id` yang sama dengan nama folder.
- `logoUrl` diisi path publik `/brand-assets/<brand-id>/logo.<ext>`.
- Logo yang diunggah lewat aplikasi akan ditulis ke folder ini secara otomatis.
- Folder ini ikut version control agar nama brand dan logo tidak hilang.

## Menambah brand baru

1. Buat folder `assets/brands/<brand-id>/`.
2. Salin `brand.json` dari brand lain, lalu ubah `id`, nama, handle, warna, dan font.
3. Taruh file logo di folder yang sama.
4. Commit perubahannya.
