<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'units';

    protected $fillable = [
        'name',
        'type',
        'location',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'integer',
        ];
    }

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'unit_id');
    }

    public function alertRules(): HasMany
    {
        return $this->hasMany(AlertRule::class, 'unit_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'unit_id');
    }

    public function productionCycles(): HasMany
    {
        return $this->hasMany(ProductionCycle::class, 'unit_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'unit_id');
    }
}
