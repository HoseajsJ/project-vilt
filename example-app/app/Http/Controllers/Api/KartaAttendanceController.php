<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\KartaAttendance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KartaAttendanceController extends Controller
{
    public function index(Request $request, int $activityId): JsonResponse
    {
        $meeting = Activity::query()->where('category', 'rapat')->find($activityId);
        if (! $meeting) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Jadwal rapat tidak ditemukan', 'data' => null], 404);
        }

        $members = User::query()
            ->where('role', User::ROLE_PENGURUS)
            ->where('status', User::STATUS_ACTIVE)
            ->orderBy('name')
            ->get(['id', 'name']);
        $attendance = $meeting->kartaAttendances()->get()->keyBy('user_id');

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar absensi berhasil dimuat',
            'data' => [
                'meeting' => $meeting,
                'members' => $members->map(function (User $member) use ($attendance) {
                    $record = $attendance->get($member->id);
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'status' => $record?->status,
                        'note' => $record?->note,
                    ];
                })->values(),
            ],
        ]);
    }

    public function update(Request $request, int $activityId): JsonResponse
    {
        if (! $request->user()->isPengurus()) {
            return response()->json(['status_code' => 403, 'status' => false, 'message' => 'Absensi ini hanya untuk anggota Karta', 'data' => null], 403);
        }

        $meeting = Activity::query()->where('category', 'rapat')->find($activityId);
        $member = User::query()->where('role', User::ROLE_PENGURUS)
            ->where('status', User::STATUS_ACTIVE)
            ->find($request->user()->id);
        if (! $meeting || ! $member) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Rapat atau anggota Karta tidak ditemukan', 'data' => null], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:hadir,izin,tidak_hadir',
            'note' => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return response()->json(['status_code' => 422, 'status' => false, 'message' => 'Status absensi tidak valid', 'data' => $validator->errors()], 422);
        }

        $record = KartaAttendance::query()->updateOrCreate(
            ['activity_id' => $meeting->id, 'user_id' => $member->id],
            ['marked_by' => $member->id, 'status' => $request->input('status'), 'note' => $request->input('note')]
        );

        return response()->json(['status_code' => 200, 'status' => true, 'message' => 'Absensi berhasil disimpan', 'data' => $record]);
    }
}
