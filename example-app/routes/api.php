<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - my23 Desa Pintar RW & Karang Taruna
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    // Authenticated Auth Routes
    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Protected Pengurus Routes (Role 1)
Route::middleware(['jwt.auth', 'role:pengurus'])->group(function () {
    Route::get('/pengurus/dashboard', function (Request $request) {
        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Dashboard pengurus diakses',
            'data' => [
                'user' => $request->user()->only(['id', 'name', 'role']),
            ],
        ]);
    });
});

// Protected Warga Routes (Role 2)
Route::middleware(['jwt.auth', 'role:warga'])->group(function () {
    Route::get('/warga/dashboard', function (Request $request) {
        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Dashboard warga diakses',
            'data' => [
                'user' => $request->user()->only(['id', 'name', 'role']),
            ],
        ]);
    });
});
