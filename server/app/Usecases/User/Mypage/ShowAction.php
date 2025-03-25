<?php

namespace App\Usecases\User\Mypage;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShowAction
{
    protected User $user;

    protected Schedule $schedule;

    public function __construct(
        User $user,
        Schedule $schedule
    ) {
        $this->user = $user;
        $this->schedule = $schedule;
    }

    public function __invoke(Request $request)
    {
        // 認証済みユーザーを取得
        $user = Auth::user();

        // ユーザーの所属ジムのIDを取得
        $adminId = $user->admin_id;

        // ユーザーの練習記録を取得し、参加したクラス情報をEager Loading
        $practiceHistories = $user->practiceHistories()
            ->with('schedule')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // ジムのスケジュールを取得
        $schedules = $this->schedule
            ->where('admin_id', $adminId)
            ->orderBy('start_time')
            ->get();

        // スケジュールを曜日ごとにグループ化（曜日の順序を考慮）
        $daysOfWeekOrder = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
        $schedulesGrouped = [];
        foreach ($daysOfWeekOrder as $day) {
            $schedulesOfDay = $schedules->where('day_of_week', $day)->values();
            if ($schedulesOfDay->isNotEmpty()) {
                $schedulesGrouped[$day] = $schedulesOfDay->toArray();
            }
        }

        return [
            'user' => $user,
            'practice_histories' => $practiceHistories,
            'schedules' => $schedulesGrouped,
        ];
    }
}
