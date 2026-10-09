<?php

namespace Database\Seeders;

use App\Models\CitizenComplaint;
use App\Models\User;
use Illuminate\Database\Seeder;

class CitizenComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $siti = User::where('name', 'Siti Aminah')->first();
        $pakrt = User::where('name', 'H. Bambang Irawan (Ketua RT 03)')->first();

        if ($siti) {
            CitizenComplaint::query()->updateOrCreate(
                ['description' => 'Lampu penerangan jalan di gang 3 depan pos ronda mati sudah 2 hari.'],
                [
                    'reporter_id' => $siti->id,
                    'category' => 'infrastruktur',
                    'location' => 'Gang 3 RT 03 depan Pos Ronda',
                    'photo_url' => null,
                    'status' => 'diproses',
                    'handled_by' => $pakrt ? $pakrt->id : null,
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
        }
    }
}