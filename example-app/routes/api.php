<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\LetterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UnitController;
use App\Models\Activity;
use App\Models\Alert;
use App\Models\CitizenComplaint;
use App\Models\LetterRequest;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - my23 Desa Pintar RW & Karang Taruna
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Authenticated Routes
Route::middleware('jwt.auth')->group(function () {

    // 1. Common / Shared Endpoints
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::get('/letter-types', [LetterController::class, 'types']);

    // Public feeds & summaries accessible to logged in users (Warga & Pengurus)
    Route::get('/public/units', [UnitController::class, 'publicIndex']);
    Route::get('/public/activities', [ActivityController::class, 'publicIndex']);
    Route::get('/public/activities/{id}', [ActivityController::class, 'show']);

    // 2. Warga Specific Endpoints
    Route::get('/complaints/mine', [ComplaintController::class, 'mine']);
    Route::post('/complaints', [ComplaintController::class, 'store']);

    Route::get('/letter-requests/mine', [LetterController::class, 'mine']);
    Route::post('/letter-requests', [LetterController::class, 'store']);

    Route::get('/warga/dashboard', function (Request $request) {
        $user = $request->user();
        $recentActivities = Activity::query()->where('status', 'published')->latest('activity_date')->limit(3)->get();
        $myLetters = LetterRequest::query()->where('user_id', $user->id)->with('letterType')->latest()->limit(5)->get();
        $myComplaints = CitizenComplaint::query()->where('reporter_id', $user->id)->latest()->limit(5)->get();
        $unitsCount = Unit::query()->where('status', 1)->count();

        return response()->json([
            'status_code' => 200,
            'status' => true,
            'message' => 'Dashboard warga berhasil dimuat',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role_name,
                ],
                'summary' => [
                    'active_units' => $unitsCount,
                    'letters_count' => $myLetters->count(),
                    'complaints_count' => $myComplaints->count(),
                ],
                'recent_activities' => $recentActivities,
                'my_letters' => $myLetters,
                'my_complaints' => $myComplaints,
            ],
        ]);
    });

    // 3. Pengurus & Pengurus RT Endpoints
    Route::middleware('role:pengurus,pengurus_karta,pengurus_rt')->group(function () {

        Route::get('/pengurus/dashboard', function (Request $request) {
            $user = $request->user();
            $units = Unit::query()->where('status', 1)->count();
            $openAlerts = Alert::query()->where('status', 'open')->count();
            $pendingLetters = LetterRequest::query()->where('status', 'menunggu_review')->count();
            $pendingComplaints = CitizenComplaint::query()->where('status', 'baru')->count();
            $activitiesCount = Activity::query()->count();

            return response()->json([
                'status_code' => 200,
                'status' => true,
                'message' => 'Dashboard pengurus berhasil dimuat',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->role_name,
                    ],
                    'stats' => [
                        'units_count' => $units,
                        'open_alerts_count' => $openAlerts,
                        'pending_letters' => $pendingLetters,
                        'pending_complaints' => $pendingComplaints,
                        'activities_count' => $activitiesCount,
                    ],
                    'recent_alerts' => Alert::query()->with('unit')->latest('triggered_at')->limit(5)->get(),
                ],
            ]);
        });

        // Units & IoT Management
        Route::get('/units', [UnitController::class, 'index']);
        Route::get('/units/{id}', [UnitController::class, 'show']);
        Route::get('/alerts', [UnitController::class, 'alerts']);
        Route::patch('/alerts/{id}/acknowledge', [UnitController::class, 'acknowledgeAlert']);
        Route::patch('/alerts/{id}/resolve', [UnitController::class, 'resolveAlert']);

        // Activities Management
        Route::get('/activities', [ActivityController::class, 'index']);
        Route::post('/activities', [ActivityController::class, 'store']);
        Route::patch('/activities/{id}/publish', [ActivityController::class, 'publish']);

        // Complaints Handling
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::patch('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);

        // Letter Requests Handling
        Route::get('/letter-requests', [LetterController::class, 'index']);
        Route::patch('/letter-requests/{id}/status', [LetterController::class, 'updateStatus']);
    });
});
