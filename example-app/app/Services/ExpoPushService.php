<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\PushToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    public function sendToUser(Notification $notification): void
    {
        $tokens = PushToken::query()->where('user_id', $notification->user_id)->pluck('token');
        foreach ($tokens as $token) {
            try {
                $response = Http::timeout(5)->post('https://exp.host/--/api/v2/push/send', [
                    'to' => $token,
                    'title' => $notification->title,
                    'body' => $notification->body,
                    'sound' => 'default',
                    'channelId' => 'default',
                    'data' => ['notificationId' => $notification->id, 'category' => $notification->category],
                ]);
                if (! $response->successful()) {
                    Log::warning('Expo push gagal dikirim', ['notification_id' => $notification->id, 'status' => $response->status()]);
                }
            } catch (\Throwable $exception) {
                Log::warning('Expo push tidak dapat dijangkau', ['notification_id' => $notification->id, 'error' => $exception->getMessage()]);
            }
        }
    }
}
