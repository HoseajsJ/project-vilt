<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $budi = User::where('name', 'Budi Santoso')->first();
        $lingkunganUnit = Unit::where('name', 'Stasiun Kualitas Udara & Lingkungan Pos 1')->first();
        $maggotUnit = Unit::where('name', 'Biopond Maggot BSF Mandiri')->first();

        if ($budi) {
            Activity::query()->updateOrCreate(
                ['title' => 'Kerja Bakti Akbar & Bersih Saluran Air RW 05'],
                [
                    'description' => 'Seluruh warga diharapkan berpartisipasi membersihkan selokan dan perapihan taman guna antisipasi musim penghujan.',
                    'category' => 'lingkungan',
                    'unit_id' => $lingkunganUnit ? $lingkunganUnit->id : null,
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
                    'unit_id' => $maggotUnit ? $maggotUnit->id : null,
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
        }
    }
}