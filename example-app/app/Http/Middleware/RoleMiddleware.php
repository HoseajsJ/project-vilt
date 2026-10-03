<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'status_code' => 401,
                'status' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        $userRoleName = $user->role_name;
        $userRoleId = (string) $user->role;

        // Check if user's role matches any allowed roles
        $hasAccess = false;
        foreach ($roles as $role) {
            $normalizedRole = strtolower(trim($role));
            if (
                $normalizedRole === $userRoleName ||
                $normalizedRole === $userRoleId ||
                ($normalizedRole === 'pengurus' && in_array($userRoleName, ['pengurus', 'pengurus_karta', 'pengurus_rt']))
            ) {
                $hasAccess = true;
                break;
            }
        }

        if (! $hasAccess) {
            return response()->json([
                'status_code' => 403,
                'status' => false,
                'message' => 'Akses ditolak: Peran pengguna tidak diizinkan',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
