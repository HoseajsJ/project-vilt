# my23 Desa Pintar — Frontend React Native Expo

Aplikasi mobile berbasis **React Native Expo** untuk platform terpadu **Desa Pintar RW & Karang Taruna (my23)**.

---

## 🌟 Fitur Utama

### 1. Pengurus Karang Taruna & RW (Role: `pengurus_karta`, `pengurus_rt`)
- **Dashboard Ringkasan:** Statistik unit budidaya aktif, peringatan sensor terbuka, jumlah surat masuk, dan pengaduan warga.
- **Monitoring IoT Budidaya Terpadu:**
  - **Kolam Lele Bioflok:** pH air, suhu air (°C), oksigen terlarut (DO mg/L).
  - **Greenhouse Hidroponik NFT:** pH larutan, nilai EC (mS/cm).
  - **Biopond Maggot BSF:** Suhu udara (°C), kelembapan (%).
  - **Stasiun Lingkungan:** Suhu & kualitas udara lingkungan.
- **Manajemen Alert IoT:** Banner otomatis ketika sensor melewati batas aman, fitur *Tandai Dibaca (Acknowledge)* dan *Selesaikan (Resolve)*.
- **Kegiatan Karta:** Buat kegiatan baru (Draft), dan publikasikan (*Publish*) yang otomatis mengirim notifikasi ke ponsel warga.
- **Pusat Layanan Surat:** Tinjau pengajuan surat pengantar warga, setujui/proses tanda tangan, dan beri catatan pengambilan fisik di rumah Pak RT.
- **Pusat Pengaduan Warga:** Tindak lanjut laporan keamanan, infrastruktur, atau sampah dengan catatan penyelesaian langsung ke pelapor.

### 2. Warga RW 05 (Role: `warga`)
- **Beranda Desa Pintar:** Banner sambutan, widget status surat aktif, jalan pintas layanan terpadu, dan feed agenda kegiatan lingkungan.
- **Layanan Surat RT/RW Online:**
  - Pengajuan surat pengantar e-KTP, KK, Domisili, SKU, SKTM secara mandiri.
  - Riwayat & status pelacakan: *Menunggu Review → Sedang Diproses → Siap Diambil di Rumah RT*.
- **Pengaduan Warga Terpadu:**
  - Form pelaporan dengan kategori (Keamanan, Lingkungan, Infrastruktur, Sosial) dan lokasi.
  - Tracking status laporan: *Baru → Diproses → Selesai* beserta catatan tindak lanjut petugas/RT.
- **Info Budidaya & Kegiatan:**
  - Informasi ramah warga mengenai program ketahanan pangan lele, sayur hidroponik, dan bank sampah maggot.
  - Feed pengumuman kerja bakti dan sosialisasi RT/RW.
- **Pemberitahuan (Notifikasi):**
  - Notifikasi saat surat siap diambil di rumah RT, respon aduan, dan agenda kegiatan baru.

---

## 🚀 Menjalankan Aplikasi

### Push notification & OTA (EAS)

Login EAS dan siapkan kredensial push Android (FCM) serta iOS (APNs) sebelum distribusi:

```bash
npx eas-cli login
npx eas-cli credentials
npx eas-cli build --platform android --profile production
```

Push notification memerlukan build native dengan `expo-notifications`; Expo Go tidak dapat menguji konfigurasi push produksi. Setelah build terpasang dan pengguna memberi izin, token perangkat tersimpan di backend dan notifikasi API akan dikirim lewat Expo Push Service.

Fitur kamera, lokasi GPS, dan kalender jadwal juga memakai modul native. Setelah backend terbaru dideploy, jalankan migrasi `php artisan migrate --force` di folder `example-app` untuk menyimpan koordinat aduan. Setelah itu buat build baru agar izin kamera/lokasi dan modul date picker tersedia di perangkat.

Untuk update JavaScript/aset yang kompatibel dengan binary terpasang:

```bash
npx eas-cli update --channel preview --message "Ringkasan perubahan"
npx eas-cli update --channel production --message "Ringkasan perubahan"
```

Update native seperti menambah/mengubah modul native, permission, atau konfigurasi app memerlukan build baru. Channel `preview` dan `production` dipetakan ke profil build masing-masing di `eas.json`.

### 1. Pastikan Backend Laravel Berjalan
Backend berjalan di port `8000`:
```bash
cd example-app
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Jalankan Expo Development Server
Masuk ke folder `mobile`:
```bash
cd mobile
npx expo start
```

Pilihan menjalankan:
- Tekan **`a`** untuk membuka di emulator Android.
- Tekan **`w`** untuk membuka di browser (Web).
- Scan QR code menggunakan aplikasi **Expo Go** di ponsel fisik Android / iOS (pastikan ponsel terhubung ke jaringan Wi-Fi yang sama).

---

## 👤 Akun Pengujian (Demo / Database)

| Peran | Username | Password | Keterangan |
|---|---|---|---|
| **Pengurus Karang Taruna** | `budi` | `password123` | Akses penuh monitoring IoT, alert sensor, & buat kegiatan |
| **Warga RW 05** | `siti` | `password123` | Akses layanan surat, lapor aduan, & info budidaya |
| **Ketua RT 03** | `pakrt` | `password123` | Akses review surat pengantar & penanganan aduan warga |

> **Catatan:** Pada layar login dan menu pengaturan (ikon gear/server di kanan atas), tersedia tombol preset instan untuk berpindah antar akun uji dengan 1 klik.

---

## 🛠️ Konfigurasi Alamat API
Secara default aplikasi mengarah ke backend staging (`https://api.my23.my.id/api`). Untuk pengembangan lokal, alamat dapat diubah langsung dari aplikasi melalui menu pengaturan:
- **Ponsel Fisik (LAN Wi-Fi):** `http://192.168.1.27:8000/api`
- **Android Emulator:** `http://10.0.2.2:8000/api`
- **Web / Localhost:** `http://127.0.0.1:8000/api`
