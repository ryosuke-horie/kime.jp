<?php

namespace App\Usecases\Admin\ContactMembers;

use App\Http\Requests\ContactMembers\ContactMembersRequest;
use App\Mail\AdminNotificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ContactMembersAction
{
    public function __construct() {}

    public function __invoke(ContactMembersRequest $request)
    {
        // ログイン中のジム情報を取得
        $admin = Auth::user();
        $adminId = $admin->id;

        // ジムのユーザーのメールアドレスのリストを取得
        $users = User::where('admin_id', $adminId)->get(['email']);

        // メール送信処理
        try {
            foreach ($users as $user) {
                // メールを直接送信
                Mail::to($user->email)->send(new AdminNotificationMail($request->message, $admin->name));
            }

            // 成功レスポンス
            return response()->json(['message' => 'メールが正常に送信されました。'], 200);
        } catch (\Exception $e) {
            \Log::error('メール送信エラー: '.$e->getMessage());

            return response()->json(['message' => 'メール送信に失敗しました。'], 500);
        }
    }
}
