<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UnitAndDeviceSeeder extends Seeder
{
    public function run(): void
    {
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
        Unit::query()->updateOrCreate(
            ['name' => 'Stasiun Kualitas Udara & Lingkungan Pos 1'],
            ['type' => 'lingkungan', 'location' => 'Taman Utama & Pos Keamanan', 'status' => 1]
        );

        Device::query()->updateOrCreate(
            ['device_code' => 'IOT-LELE-01'],
            ['unit_id' => $leleUnit->id, 'api_key_hash' => Hash::make('key-lele-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );
        Device::query()->updateOrCreate(
            ['device_code' => 'IOT-HIDRO-01'],
            ['unit_id' => $hidroUnit->id, 'api_key_hash' => Hash::make('key-hidro-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );
        Device::query()->updateOrCreate(
            ['device_code' => 'IOT-MAGGOT-01'],
            ['unit_id' => $maggotUnit->id, 'api_key_hash' => Hash::make('key-maggot-01'), 'last_seen_at' => Carbon::now(), 'status' => 1]
        );
    }
}