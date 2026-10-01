<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensorReading extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'sensor_readings';

    protected $fillable = [
        'device_id',
        'sensor_type_id',
        'value',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:3',
            'recorded_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class, 'device_id');
    }

    public function sensorType(): BelongsTo
    {
        return $this->belongsTo(SensorType::class, 'sensor_type_id');
    }
}
