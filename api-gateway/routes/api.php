<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProxyController;
use Illuminate\Support\Facades\Route;

// Rutas públicas de autenticación
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/recover',  [AuthController::class, 'recover']);

// Rutas protegidas (requieren JWT)
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Proxy hacia los 5 microservicios
    Route::any('/proxy/{service}',        [ProxyController::class, 'forward']);
    Route::any('/proxy/{service}/{path}', [ProxyController::class, 'forward'])
         ->where('path', '.*');
});