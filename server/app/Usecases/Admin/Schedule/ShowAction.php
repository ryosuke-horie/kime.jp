<?php

namespace App\Usecases\Admin\Schedule;

use App\Models\Schedule;
use Illuminate\Support\Facades\Auth;

class ShowAction
{
    protected Schedule $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    /**
     * スケジュール表示用のデータを取得
     * 曜日ごとにスケジュールをグループ化
     * 開始時間順にソート
     *
     * @return array
     */
    public function __invoke()
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        // 曜日の順序を定義
        $daysOfWeekOrder = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

        // スケジュールを取得し、開始時間でソート
        $schedules = $this->schedule
            ->where('admin_id', $adminId)
            ->orderBy('start_time')
            ->get();

        // 曜日ごとにスケジュールをグループ化
        $schedulesGrouped = [];
        foreach ($daysOfWeekOrder as $day) {
            $schedulesOfDay = $schedules->where('day_of_week', $day)->values();
            if ($schedulesOfDay->isNotEmpty()) {
                $schedulesGrouped[$day] = $schedulesOfDay;
            }
        }

        return $schedulesGrouped;
    }
}
