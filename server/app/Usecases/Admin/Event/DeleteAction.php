<?php

namespace App\Usecases\Admin\Event;

use App\Models\Event;
use Illuminate\Support\Facades\Auth;

class DeleteAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * イベント削除
     *
     * @return void
     */
    public function __invoke(int $eventId)
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        $event = $this->event
            ->where('admin_id', $adminId)
            ->where('id', $eventId)
            ->first();

        $event->delete();
    }
}
