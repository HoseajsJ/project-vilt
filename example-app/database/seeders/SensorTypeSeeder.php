<?php

namespace Database\Seeders;

use App\Models\SensorType;
use Illuminate\Database\Seeder;

class SensorTypeSeeder extends Seeder
{
    public function run(): void
    {
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

        foreach ($sensorTypes as $st) {
            SensorType::query()->updateOrCreate(['code' => $st['code']], $st);
        }
    }
}