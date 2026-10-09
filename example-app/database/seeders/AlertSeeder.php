<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\Device;
use App\Models\SensorType;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AlertSeeder extends Seeder
{
    public function run(): void
    {
        $leleUnit = Unit::where('name', 'Kolam Lele Bioflok A')->first();
        $dev1 = Device::where('device_code', 'IOT-LELE-01')->first();
        $sensorTypePh = SensorType::where('code', 'ph')->first();

        if ($leleUnit && $dev1 && $sensorTypePh) {
            $rulePh = AlertRule::query()->updateOrCreate(
                ['unit_id' => $leleUnit->id, 'sensor_type_id' => $sensorTypePh->id],
                ['min_value' => 6.5, 'max_value' => 8.5, 'severity' => 'warning', 'cooldown_minutes' => 30, 'is_active' => 1]
            );

            Alert::query()->updateOrCreate(
                ['unit_id' => $leleUnit->id, 'kind' => 'threshold', 'message' => 'Nilai pH air kolam lele stabil normal (7.15 pH)'],
                [
                    'device_id' => $dev1->id,
                    'rule_id' => $rulePh->id,
                    'severity' => 'warning',
                    'value' => 7.15,
                    'status' => 'resolved',
                    'triggered_at' => Carbon::now()->subHours(2),
                    'resolved_at' => Carbon::now()->subHours(1),
                ]
            );
        }
    }
}