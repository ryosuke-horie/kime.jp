<?php

namespace App\Usecases\User\PracticeHistory;

use App\Models\PracticeHistory;
use App\Models\User;
use App\Usecases\User\PracticeHistory\Exceptions\AlreadyEntryException;
use App\Usecases\User\PracticeHistory\Exceptions\NonExistingScheduleException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class EntryAction
{
    protected User $user;

    protected PracticeHistory $practiceHistory;

    public function __construct(
        User $user,
        PracticeHistory $practiceHistory
    ) {
        $this->user = $user;
        $this->practiceHistory = $practiceHistory;
    }

    public function __invoke()
    {
        $user = Auth::user();

        $now = Carbon::now();
        $nowPlus15 = $now->copy()->addMinutes(15); // 現在時刻に15分を加算
        $today = $now->toDateString();
        $week = $now->dayOfWeek;
        $weekName = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][$week];

        // 15分加算した現在時刻をフォーマット
        // Note: 会員は15分前くらいから受付可能とする。
        $nowPlus15Time = $nowPlus15->format('H:i:s');

        $schedule = $user->admin->schedules()
            ->where('day_of_week', $weekName)
            ->where('start_time', '<=', $nowPlus15Time) // start_time <= now + 15分
            ->where('end_time', '>=', $nowPlus15Time)   // end_time >= now + 15分
            ->first();

        if (! $schedule) {
            throw new NonExistingScheduleException;
        }

        $exists = PracticeHistory::where('user_id', $user->id)
            ->where('schedule_id', $schedule->id)
            ->whereDate('created_at', $today)
            ->exists();

        if ($exists) {
            throw new AlreadyEntryException;
        }

        $practiceHistory = PracticeHistory::create([
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'class_name' => $schedule->class_name,
            'day_of_week' => $schedule->day_of_week,
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
        ]);

        return $practiceHistory;
    }
}
