# Catatan Proyek Karta dan Deployment

> Ringkasan percakapan dan keadaan proyek untuk melanjutkan pekerjaan nanti. Ini bukan transkrip verbatim. Password, token, dan rahasia lain sengaja tidak dicatat.

## Permintaan fitur dan perbaikan aplikasi

- Pengaduan warga perlu mendukung unggah foto. Pernah muncul error `expo-image-picker` tidak ditemukan dan `Unsupported FormDataPart implementation` saat upload.
- Splash screen dinilai terlalu cepat. Ada warning `SafeAreaView` deprecated dan duplicate React child key.
- Tampilan dashboard pengurus diminta lebih sederhana karena navigasi utama sudah tersedia di tab bawah.
- Notifikasi lonceng perlu berfungsi, panel notifikasi pernah tidak bisa ditutup/kembali.
- Surat dan aduan perlu tombol detail/preview.
- Login staging perlu menghilangkan login cepat dan pergantian akun otomatis supaya anak-anak Karta dapat menguji akun masing-masing.
- Fitur kegiatan Karta: ketua Karta dapat membuat rapat, anggota melakukan absensi, dan data kehadiran dianalisis sebagai fitur terpisah dengan Naive Bayes. Prediksi bukan tugas ketua.
- Role yang diminta: Budi anggota biasa, Jidun ketua Karta. Periksa kembali implementasi role Budi di seeder sebelum membagikan APK lebih luas.
- Pernah diminta mencatat log PHP/Laravel agar error API lebih mudah dilacak.
- Tombol “Simpan Jadwal Rapat” pada Android terlihat aktif tetapi tidak merespons. Akar masalahnya validasi tanggal mengubah waktu lokal ke UTC, sehingga tanggal rapat dianggap tidak valid di zona waktu Indonesia. Validasi kalender sudah diperbaiki di `mobile/src/screens/pengurus/KegiatanScreen.tsx`; error penyimpanan API kini juga ditampilkan. Perbaikan ini memerlukan APK baru.

## Backend staging

- Repository: `project-vilt`; backend berada di `example-app`, mobile di `mobile`.
- Host VPS Ubuntu, domain API `api.my23.my.id`, public IP `43.156.111.95`.
- Backend disalin ke `/var/www/karta/example-app`.
- PHP CLI/FPM 8.3 terpasang; MariaDB 10.11 aktif. Database `karta` dan user aplikasi dibuat. Jangan simpan password di catatan ini atau kirim lewat chat.
- Composer awalnya gagal karena lock file memakai Symfony 8.1 yang perlu PHP 8.4.1. Lock file kemudian diperbarui agar dependency cocok dengan PHP 8.3, di-push, lalu `composer install --no-dev --optimize-autoloader` berhasil.
- Migrasi database sudah dijalankan. Akun demo diisi dengan `php artisan db:seed --class=UserSeeder --force`.
- `.env` disiapkan untuk production mode, MySQL/MariaDB lokal, `APP_DEBUG=false`, dan URL staging HTTPS. Pastikan password DB di `.env` benar-benar sama dengan kredensial MariaDB di VPS; jangan pernah commit `.env`.
- Node.js 22 dipasang karena Vite 8 membutuhkan Node yang lebih baru daripada Node 18.
- Asset Laravel/Vite dibuat dengan `npm install` dan `npm run build`. Error `Vite manifest not found` selesai setelah build aset.
- Nginx awalnya tidak aktif karena Apache memakai port 80. Apache dihentikan, Nginx diaktifkan, dan konfigurasi Laravel menggunakan PHP-FPM socket `/run/php/php8.3-fpm.sock`.
- DNS `api.my23.my.id` mengarah ke VPS. TLS/HTTPS Certbot berhasil; `curl -I https://api.my23.my.id` memberi `200 OK`.
- Uji `sudo certbot renew --dry-run` belum terkonfirmasi.

## Mobile dan EAS

- Default API mobile sudah diarahkan ke `https://api.my23.my.id/api`.
- URL LAN lama yang tersimpan di AsyncStorage dimigrasikan ke URL staging. Pengaturan koneksi juga punya preset staging.
- `mobile/eas.json` memiliki profil `preview` dengan distribusi internal dan Android `buildType: apk`.
- Profil `preview` sekarang ditandai dengan channel EAS Update `preview`; `expo-updates` dan konfigurasi URL/runtime masih perlu dipasang sebelum APK berikutnya dibangun.
- EAS project sudah ditautkan melalui `extra.eas.projectId` di `mobile/app.json`.
- Build EAS menampilkan QR code/tautan pemasangan APK. Terminal menawarkan pemasangan ke emulator; untuk memasang di ponsel fisik pilih `n`, lalu buka tautan atau pindai QR dari ponsel Android.
- APK seharusnya memakai backend staging, tetapi login dan alur fitur belum berhasil diverifikasi sampai selesai.

## Akun uji staging

Seeder saat ini membuat akun `budi`, `jidun`, `siti`, `pakrt`, dan `karta1`–`karta3`; password demo yang ditetapkan seeder adalah `password123`. Akun ini hanya untuk staging. Ganti/hapus sebelum layanan dipakai sebagai production.

## Lanjutkan besok

1. Uji login dari APK; catat username yang dipakai dan pesan error persisnya, tanpa membagikan password.
2. Jika gagal, cek apakah request menuju `https://api.my23.my.id/api/auth/login`, lalu lihat `storage/logs/laravel.log` di VPS untuk error terbaru.
3. Pastikan seeder benar-benar dijalankan terhadap database staging yang dipakai aplikasi dan periksa role Budi/Jidun sesuai kebutuhan.
4. Uji fitur inti: aduan/foto, surat, notifikasi, kegiatan Karta, absensi anggota, dan endpoint prediksi.
5. Jalankan `sudo certbot renew --dry-run` di VPS.
6. Tinjau perubahan lokal yang belum di-commit (`mobile/app.json` dan `mobile/src/components/ComplaintCard.tsx`) sebelum membuat commit berikutnya.
7. Commit `mobile/src/screens/pengurus/KegiatanScreen.tsx`, buat ulang APK preview EAS, lalu uji tombol simpan jadwal rapat di HP.
