<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CitizenComplaint;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    /**
     * List all complaints (Pengurus / RT)
     */
    public function index(): JsonResponse
    {
        $complaints = CitizenComplaint::query()
            ->with(['reporter', 'handler'])
            ->latest()
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar pengaduan warga berhasil diambil',
            'data' => $complaints,
        ]);
    }

    /**
     * List current user's complaints (Warga)
     */
    public function mine(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $complaints = CitizenComplaint::query()
            ->where('reporter_id', $userId)
            ->with(['handler'])
            ->latest()
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Pengaduan saya berhasil diambil',
            'data' => $complaints,
        ]);
    }

    /**
     * Store new complaint (Warga)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string|max:150',
            'photo_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors(),
            ], 422);
        }

        $complaint = CitizenComplaint::create([
            'reporter_id' => $request->user()->id,
            'category' => $request->input('category'),
            'description' => $request->input('description'),
            'location' => $request->input('location'),
            'photo_url' => $request->input('photo_url'),
            'status' => 'baru',
        ]);

        // Notify pengurus & RT
        $staff = User::query()->whereIn('role', [User::ROLE_PENGURUS, User::ROLE_PENGURUS_RT])->get();
        foreach ($staff as $s) {
            Notification::create([
                'user_id' => $s->id,
                'category' => 'report',
                'title' => 'Pengaduan Warga Baru: ' . ucfirst($complaint->category),
                'body' => 'Dari ' . $request->user()->name . ' di ' . $complaint->location,
                'ref_type' => 'complaint',
                'ref_id' => $complaint->id,
                'is_read' => 0,
            ]);
        }

        return response()->json([
            'status_code' => 201,
            'status' => true,
            'message' => 'Pengaduan berhasil dilaporkan',
            'data' => $complaint,
        ], 201);
    }

    /**
     * Update status (Pengurus / RT)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $complaint = CitizenComplaint::query()->find($id);
        if (!$complaint) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Pengaduan tidak ditemukan', 'data' => null], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:baru,diproses,selesai',
            'handler_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Status tidak valid',
                'data' => $validator->errors(),
            ], 422);
        }

        $complaint->update([
            'status' => $request->input('status'),
            'handled_by' => $request->user()->id,
            'handler_note' => $request->input('handler_note', $complaint->handler_note),
        ]);

        // Notify reporter
        Notification::create([
            'user_id' => $complaint->reporter_id,
            'category' => 'report',
            'title' => 'Pengaduan Diperbarui: Status ' . ucfirst($complaint->status),
            'body' => $complaint->handler_note ?? 'Pengaduan Anda sedang ditindaklanjuti pengurus.',
            'ref_type' => 'complaint',
            'ref_id' => $complaint->id,
            'is_read' => 0,
        ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Status pengaduan berhasil diperbarui',
            'data' => $complaint,
        ]);
    }
}
