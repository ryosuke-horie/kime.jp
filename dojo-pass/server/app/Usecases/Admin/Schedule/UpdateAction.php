<?php

namespace App\Usecases\Admin\Schedule;

use App\Http\Requests\Schedule\UpdateScheduleRequest;
use App\Models\Schedule;
use App\Usecases\Admin\Schedule\Exceptions\NonExistingScheduleException;
use Illuminate\Support\Facades\Auth;

class UpdateAction
{
    protected Schedule $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    /**
     * スケジュール更新
     *
     * @throws NonExistingScheduleException
     * @throws \Exception
     */
    public function __invoke(UpdateScheduleRequest $request, string $id): Schedule
    {
        // ジムを取得
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

        // バリデーション済みのリクエストデータを取得
        $validated = $request->validated();

        // スケジュールの更新
        try {
            $schedule->update($validated);
        } catch (\Exception $e) {
            throw new \Exception('スケジュールの更新に失敗しました');
        }

        return $schedule;
    }
}
