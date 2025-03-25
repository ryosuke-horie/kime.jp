<?php

namespace App\Usecases\Admin\Event;

use App\Mail\AdminEventNotificationMail;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class StoreAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * イベント登録
     *
     * @return void
     */
    public function __invoke(array $params)
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        $this->event->create([
            'admin_id' => $adminId,
            'title' => $params['title'],
            'event_date' => $params['event_date'],
            'deadline' => $params['deadline'],
            'content' => $params['content'],
            'notify_by_email' => $params['notify_by_email'],
        ]);

        // 通知メール送信
        if ($params['notify_by_email'] == 1) {
            // メール送信処理
            try {
                // ジムのユーザーのメールアドレスのリストを取得
                $users = User::where('admin_id', $adminId)->get(['email']);

                foreach ($users as $user) {
                    // メールを直接送信
                    Mail::to($user->email)->send(new AdminEventNotificationMail($params, $admin->name));
                }
            } catch (\Exception $e) {
                \Log::error('メール送信エラー: '.$e->getMessage());
            }
        }

    }
}
