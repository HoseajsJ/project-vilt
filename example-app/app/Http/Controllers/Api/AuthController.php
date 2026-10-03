<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(
        protected JwtService $jwtService
    ) {}

    /**
     * Handle user login per PRD section 4.1 & 5.1
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'status' => false,
                'message' => 'Input tidak lengkap atau tidak valid',
                'data' => $validator->errors(),
            ], 422);
        }

        $username = $request->input('username');
        $password = $request->input('password');

        $account = Account::query()
            ->with('user')
            ->where('username', $username)
            ->first();

        // Consistent error message for wrong username or wrong password
        if (! $account || ! Hash::check($password, $account->password)) {
            return response()->json([
                'status_code' => 401,
                'status' => false,
                'message' => 'Username atau password salah',
                'data' => null,
            ], 401);
        }

        $user = $account->user;

        // Check user active status
        if (! $user instanceof User || (int) $user->status !== User::STATUS_ACTIVE) {
            return response()->json([
                'status_code' => 403,
                'status' => false,
                'message' => 'Akun tidak aktif',
                'data' => null,
            ], 403);
        }

        $roleName = $user->role_name;
        $token = $this->jwtService->generateToken($user);

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Login berhasil',
            'data' => [
                'token' => $token,
                'role' => $roleName,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ],
        ], 200);
    }

    /**
     * Get profile of authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Data pengguna berhasil diambil',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role_name,
                'status' => $user->status,
            ],
        ], 200);
    }

    /**
     * Logout and revoke tokens by incrementing token_version
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->increment('token_version');
        }

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Logout berhasil',
            'data' => null,
        ], 200);
    }
}
