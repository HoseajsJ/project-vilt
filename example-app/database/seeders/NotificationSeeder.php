<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $siti = User::where('name', 'Siti Aminah')->first();
        $budi = User::where('name', 'Budi Santoso')->first();
        $leleUnit = Unit::where('name', 'Kolam Lele Bioflok A')->first();

        if ($siti) {
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
        }

        if ($budi && $leleUnit) {
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
}