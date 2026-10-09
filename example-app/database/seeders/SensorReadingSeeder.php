<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\SensorReading;
use App\Models\SensorType;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SensorReadingSeeder extends Seeder
{
    public function run(): void
    {
        $sensorTypes = SensorType::all()->keyBy('code');
        $dev1 = Device::where('device_code', 'IOT-LELE-01')->first();
        $dev2 = Device::where('device_code', 'IOT-HIDRO-01')->first();
        $dev3 = Device::where('device_code', 'IOT-MAGGOT-01')->first();

        if ($dev1 && isset($sensorTypes['ph'], $sensorTypes['water_temp'], $sensorTypes['do'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypes['ph']->id],
                ['value' => 7.15, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypes['water_temp']->id],
                ['value' => 28.2, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev1->id, 'sensor_type_id' => $sensorTypes['do']->id],
                ['value' => 4.6, 'recorded_at' => Carbon::now()]
            );
        }

        if ($dev2 && isset($sensorTypes['ph'], $sensorTypes['ec'], $sensorTypes['water_temp'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev2->id, 'sensor_type_id' => $sensorTypes['ph']->id],
                ['value' => 6.2, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev2->id, 'sensor_type_id' => $sensorTypes['ec']->id],
                ['value' => 1.85, 'recorded_at' => Carbon::now()]
            );
        }

        if ($dev3 && isset($sensorTypes['air_temp'], $sensorTypes['humidity'])) {
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev3->id, 'sensor_type_id' => $sensorTypes['air_temp']->id],
                ['value' => 31.4, 'recorded_at' => Carbon::now()]
            );
            SensorReading::query()->updateOrCreate(
                ['device_id' => $dev3->id, 'sensor_type_id' => $sensorTypes['humidity']->id],
                ['value' => 72.0, 'recorded_at' => Carbon::now()]
            );
        }
    }
}