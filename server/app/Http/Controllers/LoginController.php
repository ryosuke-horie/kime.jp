<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminLoginRequest;
use App\Http\Requests\UserLoginRequest;
use App\Http\Resources\TokenResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * ユーザーのログイン
     */
    public function login(UserLoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (Auth::guard('user')->attempt($credentials)) {
            $user = Auth::guard('user')->user();
            // ユーザー権限のトークンを作成
            $token = $user->createToken('user', ['user'])->plainTextToken;

            return (new TokenResource((object) ['token' => $token]))
                ->response()
                ->setStatusCode(200);
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }

    /**
     * 管理者のログイン
     */
    public function adminLogin(AdminLoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($credentials)) {
            $admin = Auth::guard('admin')->user();
            $token = $admin->createToken('admin', ['admin'])->plainTextToken;

            return (new TokenResource((object) ['token' => $token]))
                ->response()
                ->setStatusCode(200);
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }
}
