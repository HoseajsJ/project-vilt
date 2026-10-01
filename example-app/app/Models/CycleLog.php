<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'cycle_logs';

    protected $fillable = [
        'cycle_id',
        'log_type',
        'quantity',
        'quantity_unit',
        'note',
        'logged_at',
        'logged_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'logged_at' => 'datetime',
        ];
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(ProductionCycle::class, 'cycle_id');
    }

    public function logger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }
}
