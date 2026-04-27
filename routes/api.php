<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\RdvController;
use App\Http\Controllers\Api\PractitionerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/practitioners', [PractitionerController::class, 'index']);
Route::get('/practitioners/{id}/slots', [PractitionerController::class, 'slots']);

Route::middleware('token.auth')->group(function () {
    Route::get('/patients/me', [PatientController::class, 'me']);
    Route::get('/appointments', [RdvController::class, 'index']);
    Route::post('/appointments', [RdvController::class, 'store']);
    Route::patch('/appointments/{id}', [RdvController::class, 'update']);
    Route::delete('/appointments/{id}', [RdvController::class, 'destroy']);
});

