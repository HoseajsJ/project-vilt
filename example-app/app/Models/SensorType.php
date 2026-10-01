<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SensorType extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'sensor_types';

    protected $fillable = [
        'code',
        'name',
        'unit_label',
    ];

    public function sensorReadings(): HasMany
    {
        return $this->hasMany(SensorReading::class, 'sensor_type_id');
    }

    public function alertRules(): HasMany
    {
        return $this->hasMany(AlertRule::class, 'sensor_type_id');
    }
}
