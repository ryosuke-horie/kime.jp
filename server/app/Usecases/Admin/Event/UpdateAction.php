<?php

namespace App\Usecases\Admin\Event;

use App\Http\Requests\Event\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;

class UpdateAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * イベント更新
     *
     * @return void
     */
    public function __invoke(UpdateEventRequest $request, int $eventId)
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        $event = $this->event
            ->where('admin_id', $adminId)
            ->where('id', $eventId)
            ->first();

        $params = $request->validated();

        $event->update([
            'title' => $params['title'],
            'event_date' => $params['event_date'],
            'deadline' => $params['deadline'],
            'content' => $params['content'],
            'notify_by_email' => $params['notify_by_email'],
        ]);
    }
}
