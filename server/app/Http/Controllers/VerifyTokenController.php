<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class VerifyTokenController extends Controller
{
    /**
     * トークン検証してユーザー情報を返却
     */
    public function verifyToken(): \Illuminate\Http\JsonResponse
    {
        // 権限ベースで認証しているため、Admin, User どちらでも取得可能
        $user = Auth::user();

        // ユーザーが取得できなかった場合はエラーレスポンスを返す
        if (! $user) {
            return response()->json(['error' => '認証されていません'], 401);
        }

        // ユーザーを返却
        return response()->json($user);
    }
}
