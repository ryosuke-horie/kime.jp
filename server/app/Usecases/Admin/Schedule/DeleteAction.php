<?php

namespace App\Usecases\Admin\Schedule;

use App\Models\Schedule;
use App\Usecases\Admin\Schedule\Exceptions\NonExistingScheduleException;
use Illuminate\Support\Facades\Auth;

class DeleteAction
{
    protected Schedule $schedule;

    public function __construct(
        Schedule $schedule,
    ) {
        $this->schedule = $schedule;
    }

    /**
     * スケジュール削除
     * ジムに紐づくスケジュールを削除
     *
     * @param string
     *
     * @throws NonExistingScheduleException
     * @throws \Exception
     */
    public function __invoke(string $id): void
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        // スケジュールの参照
        $schedule = $this->schedule
            ->where('admin_id', $adminId)
            ->where('id', $id)
            ->first();

        // スケジュールが存在しない場合は例外を投げる
        if (! $schedule) {
            throw new NonExistingScheduleException;
        }

        $deletedSchedule = $this->schedule
            ->where('admin_id', $adminId)
            ->where('id', $id)
            ->delete();

        // 例外処理
        if (! $deletedSchedule) {
            throw new \Exception('スケジュールの削除に失敗しました');
        }
    }
}
