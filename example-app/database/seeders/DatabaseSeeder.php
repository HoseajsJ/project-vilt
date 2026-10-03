<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Activity;
use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\CitizenComplaint;
use App\Models\CycleLog;
use App\Models\Device;
use App\Models\LetterRequest;
use App\Models\LetterType;
use App\Models\Notification;
use App\Models\ProductionCycle;
use App\Models\SensorReading;
use App\Models\SensorType;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Sensor Types (Master IoT)
        $sensorTypes = [
            ['code' => 'ph', 'name' => 'pH Air', 'unit_label' => 'pH'],
            ['code' => 'water_temp', 'name' => 'Suhu Air', 'unit_label' => '°C'],
            ['code' => 'do', 'name' => 'Oksigen Terlarut', 'unit_label' => 'mg/L'],
            ['code' => 'ammonia', 'name' => 'Amonia Air', 'unit_label' => 'mg/L'],
            ['code' => 'water_level', 'name' => 'Tinggi Air', 'unit_label' => 'cm'],
            ['code' => 'ec', 'name' => 'EC Nutrisi', 'unit_label' => 'mS/cm'],
            ['code' => 'tds', 'name' => 'TDS', 'unit_label' => 'ppm'],
            ['code' => 'air_temp', 'name' => 'Suhu Lingkungan', 'unit_label' => '°C'],
            ['code' => 'humidity', 'name' => 'Kelembapan', 'unit_label' => '%'],
            ['code' => 'gas_nh3', 'name' => 'Gas Amonia', 'unit_label' => 'ppm'],
        ];

        $sensorTypeMap = [];
        foreach ($sensorTypes as $st) {
            $created = SensorType::query()->updateOrCreate(['code' => $st['code']], $st);
            $sensorTypeMap[$st['code']] = $created->id;
        }

        // 2. Seed Users & Accounts
        // Pengurus Karta (Role 1)
        $budi = User::query()->updateOrCreate(
            ['name' => 'Budi Santoso'],
            ['role' => User::ROLE_PENGURUS, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $budi->id], ['username' => 'budi', 'password' => Hash::make('password123')]);

        // Warga (Role 2)
        $siti = User::query()->updateOrCreate(
            ['name' => 'Siti Aminah'],
            ['role' => User::ROLE_WARGA, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $siti->id], ['username' => 'siti', 'password' => Hash::make('password123')]);

        // Pengurus RT (Role 3)
        $pakrt = User::query()->updateOrCreate(
            ['name' => 'H. Bambang Irawan (Ketua RT 03)'],
            ['role' => User::ROLE_PENGURUS_RT, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $pakrt->id], ['username' => 'pakrt', 'password' => Hash::make('password123')]);

        // 3. Letter Types
        $letterTypes = [
            ['name' => 'Surat Pengantar KTP / KK', 'description' => 'Untuk permohonan atau pembaharuan KTP dan Kartu Keluarga ke Kelurahan'],
            ['name' => 'Surat Keterangan Domisili', 'description' => 'Bukti tempat tinggal sementara atau tetap di lingkungan RW'],
            ['name' => 'Surat Keterangan Usaha (SKU)', 'description' => 'Untuk pengajuan izin usaha warga atau kredit UMKM'],
            ['name' => 'Surat Keterangan Tidak Mampu (SKTM)', 'description' => 'Untuk keperluan beasiswa, keringanan rumah sakit, dan bansos'],
            ['name' => 'Surat Pengantar Nikah', 'description' => 'Pengantar pengurusan berkas pernikahan ke KUA / Catatan Sipil'],
        ];
        $letterTypeIds = [];
        foreach ($letterTypes as $lt) {
            $created = LetterType::query()->updateOrCreate(['name' => $lt['name']], $lt);
            $letterTypeIds[] = $created->id;
        }

        // 4. Units & Devices
        $leleUnit = Unit::query()->updateOrCreate(
            ['name' => 'Kolam Lele Bioflok A'],
            ['type' => 'lele', 'location' => 'Lahan Karang Taruna Blok C', 'status' => 1]
        );
        $hidroUnit = Unit::query()->updateOrCreate(
            ['name' => 'Greenhouse Hidroponik NFT'],
            ['type' => 'hidroponik', 'location' => 'Pekarangan RW 05', 'status' => 1]
        );
        $maggotUnit = Unit::query()->updateOrCreate(
            ['name' => 'Biopond Maggot BSF Mandiri'],
            ['type' => 'maggot', 'location' => 'Bank Sampah RW 05', 'status' => 1]
        );
        $lingkunganUnit = Unit::query()->updateOrCreate(
            ['name' => 'Stasiun Kualitas Udara & Lingkungan Pos 1'],
            ['type' => 'lingkungan', 'location' => 'Taman Utama & Pos Keamanan', 'status' => 1]
        );

        $dev1 = Device::query()->updateOrCreate(
            ['device_code' => 'IOT-LELE-01'],
            ['unit_id' => $leleUnit->id, 'api_key_hash' => Hash::make('key-lele-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );
        $dev2 = Device::query()->updateOrCreate(
            ['device_code' => 'IOT-HIDRO-01'],
            ['unit_id' => $hidroUnit->id, 'api_key_hash' => Hash::make('key-hidro-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );
        $dev3 = Device::query()->updateOrCreate(
            ['device_code' => 'IOT-MAGGOT-01'],
            ['unit_id' => $maggotUnit->id, 'api_key_hash' => Hash::make('key-maggot-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );

        // 5. Sensor Readings (Recent)
        if (isset($sensorTypeMap['ph'], $sensorTypeMap['water_temp'], $sensorTypeMap['do'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypeMap['ph']],
                ['value' => 7.15, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypeMap['water_temp']],
                ['value' => 28.2, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypeMap['do']],
                ['value' => 4.6, 'recorded_at' => Carbon::now()]
            );
        }

        if (isset($sensorTypeMap['ph'], $sensorTypeMap['ec'], $sensorTypeMap['water_temp'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev2->id, 'sensor_type_id' => $sensorTypeMap['ph']],
                ['value' => 6.2, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev2->id, 'sensor_type_id' => $sensorTypeMap['ec']],
                ['value' => 1.85, 'recorded_at' => Carbon::now()]
            );
        }

        if (isset($sensorTypeMap['air_temp'], $sensorTypeMap['humidity'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev3->id, 'sensor_type_id' => $sensorTypeMap['air_temp']],
                ['value' => 31.4, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev3->id, 'sensor_type_id' => $sensorTypeMap['humidity']],
                ['value' => 72.0, 'recorded_at' => Carbon::now()]
            );
        }

        // 6. Alert Rules & Sample Alert
        if (isset($sensorTypeMap['ph'])) {
            $rulePh = AlertRule::query()->updateOrCreate(
                ['unit_id' => $leleUnit->id, 'sensor_type_id' => $sensorTypeMap['ph']],
                ['min_value' => 6.5, 'max_value' => 8.5, 'severity' => 'warning', 'cooldown_minutes' => 30, 'is_active' => 1]
            );

            Alert::query()->updateOrCreate(
                ['unit_id' => $leleUnit->id, 'kind' => 'threshold', 'message' => 'Nilai pH air kolam lele stabil normal (7.15 pH)'],
                [
                    'device_id' => $dev1->id,
                    'rule_id' => $rulePh->id,
                    'severity' => 'warning',
                    'value' => 7.15,
                    'status' => 'resolved',
                    'triggered_at' => Carbon::now()->subHours(2),
                    'resolved_at' => Carbon::now()->subHours(1),
                ]
            );
        }

        // 7. Production Cycles & Logs
        $cycleLele = ProductionCycle::query()->updateOrCreate(
            ['unit_id' => $leleUnit->id, 'name' => 'Siklus Pembesaran Lele Batch 4'],
            [
                'start_date' => Carbon::now()->subDays(20)->toDateString(),
                'initial_qty' => 3000,
                'status' => 'active',
                'notes' => 'Bibit ukuran 7-8 cm jenis sangkuriang super',
                'created_by' => $budi->id,
            ]
        );

        CycleLog::query()->firstOrCreate(
            ['cycle_id' => $cycleLele->id, 'log_type' => 'feeding', 'note' => 'Pemberian pelet PF-1000 sore hari'],
            ['quantity' => 4.5, 'quantity_unit' => 'kg', 'logged_at' => Carbon::now()->subHours(5), 'logged_by' => $budi->id]
        );

        $cycleHidro = ProductionCycle::query()->updateOrCreate(
            ['unit_id' => $hidroUnit->id, 'name' => 'Siklus Selada Romaine & Pakcoy Okt'],
            [
                'start_date' => Carbon::now()->subDays(12)->toDateString(),
                'initial_qty' => 450,
                'status' => 'active',
                'notes' => 'Penyemaian bibit varietas unggul',
                'created_by' => $budi->id,
            ]
        );

        // 8. Activities
        Activity::query()->updateOrCreate(
            ['title' => 'Kerja Bakti Akbar & Bersih Saluran Air RW 05'],
            [
                'description' => 'Seluruh warga diharapkan berpartisipasi membersihkan selokan dan perapihan taman guna antisipasi musim penghujan.',
                'category' => 'lingkungan',
                'unit_id' => $lingkunganUnit->id,
                'activity_date' => Carbon::now()->addDays(3)->setTime(7, 30),
                'location' => 'Balai Warga RW 05 & Lapangan Voli',
                'image_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(1),
                'created_by' => $budi->id,
            ]
        );

        Activity::query()->updateOrCreate(
            ['title' => 'Pelatihan Budidaya Maggot BSF untuk Pengelolaan Sampah'],
            [
                'description' => 'Karang Taruna mengadakan demo pengolahan sisa makanan organik warga menggunakan larva maggot BSF.',
                'category' => 'budidaya',
                'unit_id' => $maggotUnit->id,
                'activity_date' => Carbon::now()->addDays(6)->setTime(13, 0),
                'location' => 'Rumah Kompos RW 05',
                'image_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=600&auto=format&fit=crop',
                'status' => 'published',
                'published_at' => Carbon::now()->subHours(10),
                'created_by' => $budi->id,
            ]
        );

        Activity::query()->updateOrCreate(
            ['title' => 'Rapat Kerja Pengurus Karang Taruna Triwulan IV'],
            [
                'description' => 'Evaluasi keuangan budidaya lele dan persiapan peringatan Hari Sumpah Pemuda.',
                'category' => 'rapat',
                'unit_id' => null,
                'activity_date' => Carbon::now()->addDays(8)->setTime(19, 30),
                'location' => 'Sekretariat Karta',
                'image_url' => null,
                'status' => 'draft',
                'published_at' => null,
                'created_by' => $budi->id,
            ]
        );

        // 9. Citizen Complaints
        CitizenComplaint::query()->updateOrCreate(
            ['description' => 'Lampu penerangan jalan di gang 3 depan pos ronda mati sudah 2 hari.'],
            [
                'reporter_id' => $siti->id,
                'category' => 'infrastruktur',
                'location' => 'Gang 3 RT 03 depan Pos Ronda',
                'photo_url' => null,
                'status' => 'diproses',
                'handled_by' => $pakrt->id,
                'handler_note' => 'Sudah dipanggil teknisi PLN/petugas lingkungan untuk ganti bohlam LED baru sore ini.',
            ]
        );

        CitizenComplaint::query()->updateOrCreate(
            ['description' => 'Ada penumpukan daun kering dan sisa pangkas dahan di pinggir saluran utama.'],
            [
                'reporter_id' => $siti->id,
                'category' => 'lingkungan',
                'location' => 'Dekat jembatan RW 05',
                'photo_url' => null,
                'status' => 'baru',
                'handled_by' => null,
                'handler_note' => null,
            ]
        );

        // 10. Letter Requests
        if (!empty($letterTypeIds)) {
            LetterRequest::query()->updateOrCreate(
                ['user_id' => $siti->id, 'letter_type_id' => $letterTypeIds[0]],
                [
                    'status' => 'siap_diambil',
                    'notes' => 'Perpanjangan e-KTP dan perubahan status perkawinan',
                    'attachment_url' => null,
                    'admin_note' => 'Surat pengantar sudah ditandatangani RT dan RW. Silakan ambil di rumah Pak RT Bambang saat jam malam 19.30-21.00.',
                    'processed_by' => $pakrt->id,
                ]
            );

            LetterRequest::query()->updateOrCreate(
                ['user_id' => $siti->id, 'letter_type_id' => $letterTypeIds[2] ?? $letterTypeIds[0]],
                [
                    'status' => 'menunggu_review',
                    'notes' => 'Untuk kelengkapan pengajuan bantuan modal usaha kue kering RW 05',
                    'attachment_url' => null,
                    'admin_note' => null,
                    'processed_by' => null,
                ]
            );
        }

        // 11. Notifications
        Notification::query()->updateOrCreate(
            ['user_id' => $siti->id, 'title' => 'Surat Selesai & Siap Diambil'],
            [
                'category' => 'report',
                'body' => 'Surat Pengantar KTP Anda telah selesai dan siap diambil di Rumah Pak RT.',
                'ref_type' => 'letter_request',
                'ref_id' => 1,
                'is_read' => 0,
                'created_at' => Carbon::now()->subMinutes(30),
            ]
        );

        Notification::query()->updateOrCreate(
            ['user_id' => $siti->id, 'title' => 'Kegiatan Baru: Kerja Bakti Akbar'],
            [
                'category' => 'activity',
                'body' => 'Pengurus Karta mengundang seluruh warga dalam kerja bakti bersih saluran air.',
                'ref_type' => 'activity',
                'ref_id' => 1,
                'is_read' => 1,
                'read_at' => Carbon::now()->subMinutes(10),
                'created_at' => Carbon::now()->subHours(2),
            ]
        );

        Notification::query()->updateOrCreate(
            ['user_id' => $budi->id, 'title' => 'Kondisi Kolam Normal'],
            [
                'category' => 'alert',
                'body' => 'Sensor pH dan Suhu Kolam Lele dalam ambang batas aman.',
                'ref_type' => 'unit',
                'ref_id' => $leleUnit->id,
                'is_read' => 0,
                'created_at' => Carbon::now()->subHours(1),
            ]
        );
    }
}
