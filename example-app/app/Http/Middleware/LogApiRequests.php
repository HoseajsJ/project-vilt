<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = microtime(true);

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            Log::error('API request failed', [
                'method' => $request->method(),
                'path' => $request->path(),
                'ip' => $request->ip(),
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'duration_ms' => (int) ((microtime(true) - $startedAt) * 1000),
            ]);

            throw $exception;
        }

        Log::log($response->getStatusCode() >= 500 ? 'error' : 'info', 'API request completed', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
            'ip' => $request->ip(),
            'duration_ms' => (int) ((microtime(true) - $startedAt) * 1000),
        ]);

        return $response;
    }
}
