<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\SensorType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Sensor Types (Master IoT) if table exists
        if (Schema::hasTable('sensor_types')) {
            $sensorTypes = [
                ['code' => 'ph', 'name' => 'pH', 'unit_label' => 'pH'],
                ['code' => 'water_temp', 'name' => 'Suhu Air', 'unit_label' => '°C'],
                ['code' => 'do', 'name' => 'Oksigen Terlarut', 'unit_label' => 'mg/L'],
                ['code' => 'ammonia', 'name' => 'Amonia Air', 'unit_label' => 'mg/L'],
                ['code' => 'water_level', 'name' => 'Tinggi Air', 'unit_label' => 'cm'],
                ['code' => 'ec', 'name' => 'EC Larutan', 'unit_label' => 'mS/cm'],
                ['code' => 'tds', 'name' => 'TDS', 'unit_label' => 'ppm'],
                ['code' => 'air_temp', 'name' => 'Suhu Udara', 'unit_label' => '°C'],
                ['code' => 'humidity', 'name' => 'Kelembapan', 'unit_label' => '%'],
                ['code' => 'gas_nh3', 'name' => 'Gas Amonia', 'unit_label' => 'ppm'],
            ];

            foreach ($sensorTypes as $st) {
                SensorType::query()->updateOrCreate(['code' => $st['code']], $st);
            }
        }

        // 2. Seed Default Pengurus (Role 1)
        if (Schema::hasTable('users') && Schema::hasTable('accounts')) {
            $pengurusUser = User::query()->firstOrCreate(
                ['name' => 'Budi Santoso'],
                [
                    'role' => User::ROLE_PENGURUS,
                    'token_version' => 0,
                    'status' => User::STATUS_ACTIVE,
                ]
            );

            Account::query()->firstOrCreate(
                ['username' => 'budi'],
                [
                    'user_id' => $pengurusUser->id,
                    'password' => Hash::make('password123'),
                ]
            );

            // 3. Seed Default Warga (Role 2)
            $wargaUser = User::query()->firstOrCreate(
                ['name' => 'Siti Aminah'],
                [
                    'role' => User::ROLE_WARGA,
                    'token_version' => 0,
                    'status' => User::STATUS_ACTIVE,
                ]
            );

            Account::query()->firstOrCreate(
                ['username' => 'siti'],
                [
                    'user_id' => $wargaUser->id,
                    'password' => Hash::make('password123'),
                ]
            );
        }
    }
}
