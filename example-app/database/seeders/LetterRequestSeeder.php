<?php

namespace Database\Seeders;

use App\Models\LetterRequest;
use App\Models\LetterType;
use App\Models\User;
use Illuminate\Database\Seeder;

class LetterRequestSeeder extends Seeder
{
    public function run(): void
    {
        $siti = User::where('name', 'Siti Aminah')->first();
        $pakrt = User::where('name', 'H. Bambang Irawan (Ketua RT 03)')->first();
        $letterType1 = LetterType::where('name', 'Surat Pengantar KTP / KK')->first();
        $letterType3 = LetterType::where('name', 'Surat Keterangan Usaha (SKU)')->first();

        if ($siti && $letterType1) {
            LetterRequest::query()->updateOrCreate(
                ['user_id' => $siti->id, 'letter_type_id' => $letterType1->id],
                [
                    'status' => 'siap_diambil',
                    'notes' => 'Perpanjangan e-KTP dan perubahan status perkawinan',
                    'attachment_url' => null,
                    'admin_note' => 'Surat pengantar sudah ditandatangani RT dan RW. Silakan ambil di rumah Pak RT Bambang saat jam malam 19.30-21.00.',
                    'processed_by' => $pakrt ? $pakrt->id : null,
                ]
            );
        }

        if ($siti && ($letterType3 || $letterType1)) {
            $lt = $letterType3 ?: $letterType1;
            LetterRequest::query()->updateOrCreate(
                ['user_id' => $siti->id, 'letter_type_id' => $lt->id],
                [
                    'status' => 'menunggu_review',
                    'notes' => 'Untuk kelengkapan pengajuan bantuan modal usaha kue kering RW 05',
                    'attachment_url' => null,
                    'admin_note' => null,
                    'processed_by' => null,
                ]
            );
        }
    }
}