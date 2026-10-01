<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertRule extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'alert_rules';

    protected $fillable = [
        'unit_id',
        'sensor_type_id',
        'min_value',
        'max_value',
        'severity',
        'cooldown_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_value' => 'decimal:3',
            'max_value' => 'decimal:3',
            'cooldown_minutes' => 'integer',
            'is_active' => 'integer',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function sensorType(): BelongsTo
    {
        return $this->belongsTo(SensorType::class, 'sensor_type_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'rule_id');
    }
}
