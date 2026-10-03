<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List user notifications
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = Notification::query()->where('user_id', $userId);

        if ($request->boolean('unread')) {
            $query->where('is_read', 0);
        }

        $notifications = $query->latest('created_at')->limit(50)->get();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Notifikasi berhasil diambil',
            'data' => $notifications,
        ]);
    }

    /**
     * Count unread notifications
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', 0)
            ->count();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Jumlah notifikasi belum dibaca',
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    /**
     * Mark single notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notif = Notification::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$notif) {
            return response()->json(['status_code' => 404, 'status' => false, 'message' => 'Notifikasi tidak ditemukan', 'data' => null], 404);
        }

        $notif->update([
            'is_read' => 1,
            'read_at' => now(),
        ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Notifikasi ditandai sudah dibaca',
            'data' => $notif,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', 0)
            ->update([
                'is_read' => 1,
                'read_at' => now(),
            ]);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Semua notifikasi ditandai sudah dibaca',
            'data' => null,
        ]);
    }
}
