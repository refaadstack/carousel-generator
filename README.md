# Carousel Studio

Pembuat konten carousel dan video pendek untuk sosial media. Satu aplikasi untuk mengelola
brand, membuat konten dengan AI, mengedit slide, menyimpan riwayat, menjadwalkan konten, dan
mengekspor PNG/PDF/MP4.

## Stack

- Frontend: React 19, Vite, Tailwind CSS 4
- Backend: Express, TypeScript
- Video: Remotion
- AI: endpoint OpenAI-compatible dari 9router
- Database: MySQL eksternal di `192.168.1.250:3306`

## Struktur penting

```
server.ts                 API, render video, koneksi MySQL, brand kit
src/                      frontend React
remotion/                 komposisi video
assets/brands/            brand kit: brand.json + logo, ikut version control
docker/compose.yaml       deployment Docker
db/history.sqlite         data lama, hanya dipakai sekali untuk migrasi
```

## Konfigurasi

Salin `docker/.env` bila membuat deployment baru, lalu isi:

```
AI_BASE_URL="http://host.docker.internal:8794/v1"
AI_API_KEY="..."
AI_MODEL="coding"

DB_HOST="192.168.1.250"
DB_PORT="3306"
DB_USER="kael"
DB_PASSWORD="..."
DB_NAME="carousel_generator"
```

`DB_HOST` harus menunjuk ke LXC MySQL, bukan `127.0.0.1` dan bukan nama container.
Database dan tabel dibuat otomatis saat server pertama kali jalan.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Server berjalan di `http://127.0.0.1:3000`. Saat dev, `docker/.env` ikut dibaca.

## Menjalankan dengan Docker

```bash
sudo docker compose -f docker/compose.yaml up -d --build
sudo docker compose -f docker/compose.yaml logs -f app
```

Aplikasi tersedia di `http://127.0.0.1:8796` dan `http://192.168.1.3:8796`.
Port hanya di-bind ke loopback dan IP LAN server. Aplikasi tidak memiliki autentikasi,
jadi jangan diekspos ke internet tanpa proteksi tambahan.

## Brand kit

Setiap brand disimpan di `assets/brands/<brand-id>/`:

```
brand.json
logo.svg | logo.png | logo.webp
```

Nama brand, warna, font, dan logo disimpan sebagai file di repo. Upload logo dari aplikasi
akan menulis file ke folder tersebut. Folder ini di-mount ke container, jadi perubahan
langsung tersimpan di host dan bisa di-commit.

## Riwayat kerja

Riwayat carousel disimpan di MySQL, bukan di `localStorage`. Setiap simpanan menyertakan
snapshot brand agar tampilan karya lama tetap sama walaupun brand diedit kemudian.
Data lama dari `db/history.sqlite` dimigrasikan otomatis saat tabel MySQL masih kosong.

## API

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/health` | Status server dan database |
| GET | `/api/brands` | Daftar brand dari brand kit |
| PUT | `/api/brands/:id` | Simpan brand |
| POST | `/api/brands/:id/logo` | Upload logo (SVG/PNG/WebP, maks 2MB) |
| DELETE | `/api/brands/:id` | Hapus brand |
| GET | `/api/history` | Riwayat, bisa difilter `?date=YYYY-MM-DD` |
| POST | `/api/history` | Simpan carousel ke riwayat |
| PATCH | `/api/history/:id` | Ubah pin, judul, atau tanggal jadwal |
| DELETE | `/api/history/:id` | Hapus riwayat |
| POST | `/api/generate` | Generate konten carousel |
| POST | `/api/generate-video` | Generate script video |
| POST | `/api/generate-image` | Cari gambar stok |
| POST | `/api/render-video` | Render carousel ke MP4 |
| POST | `/api/render-motion-video` | Render motion video ke MP4 |
