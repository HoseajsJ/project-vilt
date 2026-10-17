<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Services\ExpoPushService;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'notifications';

    protected static function booted(): void
    {
        static::created(function (self $notification): void {
            app(ExpoPushService::class)->sendToUser($notification);
        });
    }

    protected $fillable = [
        'user_id',
        'category',
        'title',
        'body',
        'ref_type',
        'ref_id',
        'is_read',
        'read_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
