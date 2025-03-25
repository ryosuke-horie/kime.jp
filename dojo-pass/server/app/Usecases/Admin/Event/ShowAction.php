<?php

namespace App\Usecases\Admin\Event;

use App\Models\Event;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ShowAction
{
    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * ジムのイベント詳細を取得（ユーザーの参加状況とユーザー画像を含む）
     *
     * @return \App\Models\Event
     *
     * @throws ModelNotFoundException
     */
    public function __invoke(int $eventId)
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        // attendances とその関連ユーザーおよびユーザー画像をイーガーロード
        $event = $this->event
            ->with(['attendances.user.userImages'])
            ->where('admin_id', $adminId)
            ->where('id', $eventId)
            ->firstOrFail();

        // ユーザーの画像情報をフルパスに変換
        $event->attendances->each(function ($attendance) {
            $attendance->user->userImages->each(function ($image) {
                $image->image_path = Storage::disk('s3')->url($image->image_path);
            });
        });

        return $event;
    }
}
