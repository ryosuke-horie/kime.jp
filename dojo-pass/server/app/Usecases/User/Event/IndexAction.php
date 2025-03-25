<?php

namespace App\Usecases\User\Event;

use App\Models\Event;
use Illuminate\Support\Facades\Auth;

class IndexAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    public function __invoke()
    {
        // tokenからユーザーを取得
        $user = Auth::user();
        // adminIdを取得
        $adminId = $user->admin_id;

        // イベント一覧を取得
        // 各イベントへの参加状況も存在するなら付加する
        $events = $this->event
            ->where('admin_id', $adminId)
            ->with(['attendances' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('event_date', 'asc')
            ->get();

        return [
            'events' => $events,
        ];
    }
}
