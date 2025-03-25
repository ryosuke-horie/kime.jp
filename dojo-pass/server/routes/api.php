<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\ContactMembersController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\PracticeHistoryController as AdminPracticeHistoryController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\User\EventAttendanceController as UserEventAttendanceController;
use App\Http\Controllers\User\EventController as UserEventController;
use App\Http\Controllers\User\MypageController;
use App\Http\Controllers\User\PracticeHistoryController as UserPracticeHistoryController;
use App\Http\Controllers\User\SignupController;
use App\Http\Controllers\VerifyTokenController;
use Illuminate\Support\Facades\Route;

// 管理者（ジム）作成エンドポイント
Route::post('create', [AdminController::class, 'store'])->name('create');

// ユーザー用のルート
Route::prefix('user')->group(function () {
    // 会員登録
    Route::post('signup', [SignupController::class, 'signup'])->middleware('guest')->name('user.signup');
    // ユーザーのログイン
    Route::post('login', [LoginController::class, 'login'])->middleware('guest')->name('user.login');
    // user権限のSanctum認証が必要なルート
    Route::middleware(['auth:sanctum', 'abilities:user'])->group(function () {
        Route::get('mypage', [MypageController::class, 'show'])->name('user.mypage');
        Route::post('entry', [UserPracticeHistoryController::class, 'entry'])->name('user.entry');

        // イベント一覧・詳細・参加
        Route::prefix('events')->name('user.events.')->group(function () {
            Route::get('/', [UserEventController::class, 'index'])->name('index'); // イベント一覧
            Route::post('/{id}/attendance', [UserEventAttendanceController::class, 'update'])->name('attendance.update'); // 参加可否の更新
        });
    });
});

// 管理者用のルート
Route::prefix('admin')->group(function () {
    // 管理者のログイン
    Route::post('login', [LoginController::class, 'adminLogin'])->middleware('guest')->name('admin.login');
    // 認証が必要なルート
    Route::middleware(['auth:sanctum', 'abilities:admin'])->group(function () {
        Route::get('verify-token', [VerifyTokenController::class, 'verifyToken'])->name('admin.verify-token');
        Route::get('histories', [AdminPracticeHistoryController::class, 'histories'])->name('admin.histories');
        Route::post('contact-members', [ContactMembersController::class, 'contactMembers'])->name('admin.contact-members');

        // スケジュール
        Route::prefix('schedules')->name('admin.schedules.')->group(function () {
            Route::get('/', [ScheduleController::class, 'show'])->name('index');
            Route::post('/', [ScheduleController::class, 'store'])->name('store');
            Route::delete('/{id}', [ScheduleController::class, 'destroy'])->name('destroy');
            Route::post('/{id}', [ScheduleController::class, 'update'])->name('update');
        });

        // イベント管理
        Route::prefix('events')->name('admin.events.')->group(function () {
            Route::get('/', [AdminEventController::class, 'index'])->name('index'); // イベント一覧
            Route::post('/', [AdminEventController::class, 'store'])->name('store'); // イベント作成
            Route::get('/{id}', [AdminEventController::class, 'show'])->name('show'); // イベント詳細
            Route::post('/{id}/update', [AdminEventController::class, 'update'])->name('update'); // イベント更新
            Route::delete('/{id}', [AdminEventController::class, 'destroy'])->name('destroy'); // イベント削除
        });
    });
});
