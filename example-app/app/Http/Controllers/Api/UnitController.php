<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\Device;
use App\Models\ProductionCycle;
use App\Models\SensorReading;
use App\Models\SensorType;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * List all units (Pengurus)
     */
    public function index(): JsonResponse
    {
        $units = Unit::query()
            ->with(['devices.sensorReadings' => function ($q) {
                $q->latest('recorded_at')->limit(10);
            }])
            ->get()
            ->map(function ($unit) {
                $activeCycle = ProductionCycle::query()
                    ->where('unit_id', $unit->id)
                    ->where('status', 'active')
                    ->latest()
                    ->first();

                // Get latest sensor readings for this unit
                $devices = Device::query()->where('unit_id', $unit->id)->pluck('id');
                $readings = [];
                if ($devices->isNotEmpty()) {
                    $latestReadings = SensorReading::query()
                        ->whereIn('device_id', $devices)
                        ->orderByDesc('recorded_at')
                        ->get()
                        ->unique('sensor_type_id');

                    $sensorTypes = SensorType::all()->keyBy('id');
                    foreach ($latestReadings as $r) {
                        $st = $sensorTypes->get($r->sensor_type_id);
                        if ($st) {
                            $readings[] = [
                                'code' => $st->code,
                                'name' => $st->name,
                                'value' => (float) $r->value,
                                'unit' => $st->unit_label,
                                'recorded_at' => $r->recorded_at,
                            ];
                        }
                    }
                }

                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type,
                    'location' => $unit->location,
                    'status' => $unit->status,
                    'active_cycle' => $activeCycle ? [
                        'id' => $activeCycle->id,
                        'name' => $activeCycle->name,
                        'start_date' => $activeCycle->start_date,
                        'initial_qty' => $activeCycle->initial_qty,
                    ] : null,
                    'latest_readings' => $readings,
                ];
            });

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar unit berhasil diambil',
            'data' => $units,
        ]);
    }

    /**
     * Public summary of units for warga
     */
    public function publicIndex(): JsonResponse
    {
        $units = Unit::query()->where('status', 1)->get()->map(function ($u) {
            $activeCycle = ProductionCycle::query()->where('unit_id', $u->id)->where('status', 'active')->first();
            return [
                'id' => $u->id,
                'name' => $u->name,
                'type' => $u->type,
                'location' => $u->location,
                'status' => 'Beroperasi Normal',
                'cycle_name' => $activeCycle?->name ?? 'Pemeliharaan',
            ];
        });

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Ringkasan unit untuk warga berhasil diambil',
            'data' => $units,
        ]);
    }

    /**
     * Show single unit details
     */
    public function show(int $id): JsonResponse
    {
        $unit = Unit::query()->find($id);
        if (!$unit) {
            return response()->json([
                'status_code' => 404,
                'status' => false,
                'message' => 'Unit tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $devices = Device::query()->where('unit_id', $unit->id)->get();
        $alertRules = AlertRule::query()->where('unit_id', $unit->id)->get();
        $activeCycle = ProductionCycle::query()->where('unit_id', $unit->id)->where('status', 'active')->first();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Detail unit berhasil diambil',
            'data' => [
                'unit' => $unit,
                'devices' => $devices,
                'alert_rules' => $alertRules,
                'active_cycle' => $activeCycle,
            ],
        ]);
    }

    /**
     * Get alerts list
     */
    public function alerts(Request $request): JsonResponse
    {
        $query = Alert::query()->with(['unit']);
        if ($request->has('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }
        $alerts = $query->latest('triggered_at')->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar alert berhasil diambil',
            'data' => $alerts,
        ]);
    }

    /**
     * Acknowledge alert
     */
    public function acknowledgeAlert(Request $request, int $id): JsonResponse
    {
        $alert = Alert::query()->find($id);
        if (!$alert) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Alert tidak ditemukan', 'data' => null], 404);
        }

        $alert->update([
            'status' => 'acknowledged',
            'acknowledged_by' => $request->user()?->id,
            'acknowledged_at' => now(),
        ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Alert telah di-acknowledge',
            'data' => $alert,
        ]);
    }

    /**
     * Resolve alert
     */
    public function resolveAlert(Request $request, int $id): JsonResponse
    {
        $alert = Alert::query()->find($id);
        if (!$alert) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Alert tidak ditemukan', 'data' => null], 404);
        }

        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Alert berhasil diselesaikan (resolved)',
            'data' => $alert,
        ]);
    }
}
