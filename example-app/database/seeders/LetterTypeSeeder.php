<?php

namespace Database\Seeders;

use App\Models\LetterType;
use Illuminate\Database\Seeder;

class LetterTypeSeeder extends Seeder
{
    public function run(): void
    {
        $letterTypes = [
            ['name' => 'Surat Pengantar KTP / KK', 'description' => 'Untuk permohonan atau pembaharuan KTP dan Kartu Keluarga ke Kelurahan'],
            ['name' => 'Surat Keterangan Domisili', 'description' => 'Bukti tempat tinggal sementara atau tetap di lingkungan RW'],
            ['name' => 'Surat Keterangan Usaha (SKU)', 'description' => 'Untuk pengajuan izin usaha warga atau kredit UMKM'],
            ['name' => 'Surat Keterangan Tidak Mampu (SKTM)', 'description' => 'Untuk keperluan beasiswa, keringanan rumah sakit, dan bansos'],
            ['name' => 'Surat Pengantar Nikah', 'description' => 'Pengantar pengurusan berkas pernikahan ke KUA / Catatan Sipil'],
        ];

        foreach ($letterTypes as $lt) {
            LetterType::query()->updateOrCreate(['name' => $lt['name']], $lt);
        }
    }
}