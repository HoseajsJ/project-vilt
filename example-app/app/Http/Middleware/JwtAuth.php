<?php

namespace App\Http\Middleware;

use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    public function __construct(
        protected JwtService $jwtService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'status_code' => 401,
                'status' => false,
                'message' => 'Token otentikasi tidak ditemukan',
                'data' => null,
            ], 401);
        }

        $user = $this->jwtService->validateUserToken($token);

        if (! $user) {
            return response()->json([
                'status_code' => 401,
                'status' => false,
                'message' => 'Token tidak valid atau sudah kedaluwarsa',
                'data' => null,
            ], 401);
        }

        // Set authenticated user in request
        $request->setUserResolver(fn () => $user);
        auth()->setUser($user);

        return $next($request);
    }
}
