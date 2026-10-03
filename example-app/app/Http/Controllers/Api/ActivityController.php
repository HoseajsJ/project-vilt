<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ActivityController extends Controller
{
    /**
     * List activities for Pengurus (includes draft & published)
     */
    public function index(): JsonResponse
    {
        $activities = Activity::query()
            ->with(['unit'])
            ->orderByDesc('activity_date')
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar kegiatan berhasil diambil',
            'data' => $activities,
        ]);
    }

    /**
     * Public feed for Warga (published only)
     */
    public function publicIndex(): JsonResponse
    {
        $activities = Activity::query()
            ->where('status', 'published')
            ->with(['unit'])
            ->orderByDesc('activity_date')
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Feed kegiatan warga berhasil diambil',
            'data' => $activities,
        ]);
    }

    /**
     * Show activity detail
     */
    public function show(int $id): JsonResponse
    {
        $activity = Activity::query()->with('unit')->find($id);
        if (!$activity) {
            return response()->json([
                'status_code' => 404,
                'status' => false,
                'message' => 'Kegiatan tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Detail kegiatan berhasil diambil',
            'data' => $activity,
        ]);
    }

    /**
     * Create new activity (Pengurus)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'unit_id' => 'nullable|integer',
            'activity_date' => 'required',
            'location' => 'nullable|string|max:150',
            'image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors(),
            ], 422);
        }

        $activity = Activity::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'unit_id' => $request->input('unit_id'),
            'activity_date' => $request->input('activity_date'),
            'location' => $request->input('location'),
            'image_url' => $request->input('image_url'),
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'status_code' => 201,
            'status' => true,
            'message' => 'Kegiatan berhasil dibuat',
            'data' => $activity,
        ], 201);
    }

    /**
     * Publish activity (Pengurus) -> triggers notification to all active warga
     */
    public function publish(int $id): JsonResponse
    {
        $activity = Activity::query()->find($id);
        if (!$activity) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Kegiatan tidak ditemukan', 'data' => null], 404);
        }

        $activity->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Create notification for active warga
        $wargaUsers = User::query()->where('role', User::ROLE_WARGA)->where('status', User::STATUS_ACTIVE)->get();
        foreach ($wargaUsers as $u) {
            Notification::create([
                'user_id' => $u->id,
                'category' => 'activity',
                'title' => 'Kegiatan Baru Dipublikasikan: ' . $activity->title,
                'body' => $activity->description ? mb_strimwidth($activity->description, 0, 100, '...') : 'Ada kegiatan baru dari Karang Taruna RW.',
                'ref_type' => 'activity',
                'ref_id' => $activity->id,
                'is_read' => 0,
            ]);
        }

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Kegiatan berhasil dipublikasikan ke warga',
            'data' => $activity,
        ]);
    }
}
