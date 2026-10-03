<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LetterRequest;
use App\Models\LetterType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LetterController extends Controller
{
    /**
     * Master Letter Types
     */
    public function types(): JsonResponse
    {
        $types = LetterType::query()->where('is_active', 1)->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar jenis surat berhasil diambil',
            'data' => $types,
        ]);
    }

    /**
     * List all letter requests (Pengurus RT / Pengurus)
     */
    public function index(): JsonResponse
    {
        $requests = LetterRequest::query()
            ->with(['user', 'letterType', 'processor'])
            ->latest()
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Daftar permohonan surat berhasil diambil',
            'data' => $requests,
        ]);
    }

    /**
     * List current user's letter requests (Warga)
     */
    public function mine(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $requests = LetterRequest::query()
            ->where('user_id', $userId)
            ->with(['letterType', 'processor'])
            ->latest()
            ->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Permohonan surat saya berhasil diambil',
            'data' => $requests,
        ]);
    }

    /**
     * Submit new letter request (Warga)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'letter_type_id' => 'required|exists:letter_types,id',
            'notes' => 'nullable|string',
            'attachment_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors(),
            ], 422);
        }

        $letterRequest = LetterRequest::create([
            'user_id' => $request->user()->id,
            'letter_type_id' => $request->input('letter_type_id'),
            'status' => 'menunggu_review',
            'notes' => $request->input('notes'),
            'attachment_url' => $request->input('attachment_url'),
        ]);

        // Notify RT
        $rtUsers = User::query()->whereIn('role', [User::ROLE_PENGURUS_RT, User::ROLE_PENGURUS])->get();
        foreach ($rtUsers as $rt) {
            Notification::create([
                'user_id' => $rt->id,
                'category' => 'report',
                'title' => 'Permohonan Surat Baru',
                'body' => $request->user()->name . ' mengajukan permohonan surat.',
                'ref_type' => 'letter_request',
                'ref_id' => $letterRequest->id,
                'is_read' => 0,
            ]);
        }

        return response()->json([
            'status_code' => 201,
            'status' => true,
            'message' => 'Permohonan surat berhasil diajukan',
            'data' => $letterRequest,
        ], 201);
    }

    /**
     * Update request status (Pengurus RT)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $letterRequest = LetterRequest::query()->find($id);
        if (!$letterRequest) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Permohonan tidak ditemukan', 'data' => null], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:menunggu_review,diproses,siap_diambil,ditolak',
            'admin_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Status permohonan tidak valid',
                'data' => $validator->errors(),
            ], 422);
        }

        $letterRequest->update([
            'status' => $request->input('status'),
            'admin_note' => $request->input('admin_note', $letterRequest->admin_note),
            'processed_by' => $request->user()->id,
        ]);

        // Notify warga
        $statusLabels = [
            'diproses' => 'Sedang Diproses Pengurus RT',
            'siap_diambil' => 'Selesai & Siap Diambil di Rumah RT',
            'ditolak' => 'Permohonan Ditolak',
        ];
        $label = $statusLabels[$letterRequest->status] ?? $letterRequest->status;

        Notification::create([
            'user_id' => $letterRequest->user_id,
            'category' => 'report',
            'title' => 'Surat Anda: ' . $label,
            'body' => $letterRequest->admin_note ?? 'Status permohonan surat Anda telah diperbarui.',
            'ref_type' => 'letter_request',
            'ref_id' => $letterRequest->id,
            'is_read' => 0,
        ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Status permohonan surat berhasil diperbarui',
            'data' => $letterRequest,
        ]);
    }
}
