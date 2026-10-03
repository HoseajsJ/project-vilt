<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenComplaint extends Model
{
    use HasFactory;

    protected $table = 'citizen_complaints';

    protected $fillable = [
        'reporter_id',
        'category',
        'description',
        'location',
        'photo_url',
        'status',
        'handled_by',
        'handler_note',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
