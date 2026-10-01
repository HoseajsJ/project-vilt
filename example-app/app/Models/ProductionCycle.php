<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionCycle extends Model
{
    use HasFactory;

    protected $table = 'production_cycles';

    protected $fillable = [
        'unit_id',
        'name',
        'start_date',
        'end_date',
        'initial_qty',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'initial_qty' => 'decimal:2',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function cycleLogs(): HasMany
    {
        return $this->hasMany(CycleLog::class, 'cycle_id');
    }
}
