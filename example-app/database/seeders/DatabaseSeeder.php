<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SensorTypeSeeder::class,
            UserSeeder::class,
            LetterTypeSeeder::class,
            UnitAndDeviceSeeder::class,
            SensorReadingSeeder::class,
            AlertSeeder::class,
            ProductionCycleSeeder::class,
            ActivitySeeder::class,
            CitizenComplaintSeeder::class,
            LetterRequestSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}