<?php

namespace App\Usecases\Admin\Event;

use App\Models\Event;
use Illuminate\Support\Facades\Auth;

class IndexAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * ジムのイベント一覧を取得
     *
     * @return array
     */
    public function __invoke()
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        // ジムのイベントを取得
        $events = $this->event
            ->where('admin_id', $adminId)
            ->orderBy('event_date') // イベントの開催日時でソート
            ->get();

        return $events;
    }
}
