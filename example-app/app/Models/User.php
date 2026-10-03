<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLE_PENGURUS = 1;

    public const ROLE_WARGA = 2;

    public const ROLE_PENGURUS_RT = 3;

    public const STATUS_INACTIVE = 0;

    public const STATUS_ACTIVE = 1;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'role',
        'token_version',
        'status',
        // Optional legacy columns retained for database flexibility
        'email',
        'username',
        'first_name',
        'last_name',
    ];

    protected function casts(): array
    {
        return [
            'role' => 'integer',
            'token_version' => 'integer',
            'status' => 'integer',
        ];
    }

    public function account(): HasOne
    {
        return $this->hasOne(Account::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function pushTokens(): HasMany
    {
        return $this->hasMany(PushToken::class, 'user_id');
    }

    public function isPengurus(): bool
    {
        return (int) $this->role === self::ROLE_PENGURUS;
    }

    public function isWarga(): bool
    {
        return (int) $this->role === self::ROLE_WARGA;
    }

    public function isPengurusRt(): bool
    {
        return (int) $this->role === self::ROLE_PENGURUS_RT;
    }

    public function isActive(): bool
    {
        return (int) $this->status === self::STATUS_ACTIVE;
    }

    public function getRoleNameAttribute(): string
    {
        return match ((int) $this->role) {
            self::ROLE_PENGURUS => 'pengurus_karta',
            self::ROLE_PENGURUS_RT => 'pengurus_rt',
            default => 'warga',
        };
    }
}
