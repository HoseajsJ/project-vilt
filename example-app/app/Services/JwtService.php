<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

class JwtService
{
    private string $key;

    private string $algorithm = 'HS256';

    public function __construct()
    {
        $appKey = (string) config('app.key');
        if (str_starts_with($appKey, 'base64:')) {
            $this->key = base64_decode(substr($appKey, 7));
        } else {
            $this->key = $appKey;
        }
    }

    /**
     * Generate JWT token for user according to my23 PRD Section 5.6
     * Claims: sub, role, token_version, exp, iat
     */
    public function generateToken(User $user, int $ttlHours = 24): string
    {
        $now = time();
        $roleName = $user->role_name;

        $payload = [
            'iss' => config('app.url', 'http://localhost:8000'),
            'sub' => $user->id,
            'role' => $roleName,
            'token_version' => (int) $user->token_version,
            'iat' => $now,
            'exp' => $now + ($ttlHours * 3600),
        ];

        return JWT::encode($payload, $this->key, $this->algorithm);
    }

    /**
     * Decode and verify token
     */
    public function decodeToken(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key($this->key, $this->algorithm));
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * Validate token against user and check token_version & active status
     */
    public function validateUserToken(string $token): ?User
    {
        $payload = $this->decodeToken($token);
        if (! $payload || ! isset($payload->sub, $payload->token_version)) {
            return null;
        }

        $user = User::query()->find($payload->sub);
        if (! $user) {
            return null;
        }

        // Account must be active (status == 1)
        if ((int) $user->status !== 1) {
            return null;
        }

        // token_version must match. Increasing token_version invalidates old tokens.
        if ((int) $user->token_version !== (int) $payload->token_version) {
            return null;
        }

        return $user;
    }
}
