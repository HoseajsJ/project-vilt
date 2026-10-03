<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LetterRequest extends Model
{
    use HasFactory;

    protected $table = 'letter_requests';

    protected $fillable = [
        'user_id',
        'letter_type_id',
        'status',
        'notes',
        'attachment_url',
        'admin_note',
        'processed_by',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function letterType(): BelongsTo
    {
        return $this->belongsTo(LetterType::class, 'letter_type_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
