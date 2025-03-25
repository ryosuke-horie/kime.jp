<?php

namespace App\Usecases\Admin\Schedule;

use App\Http\Requests\Schedule\StoreScheduleRequest;
use App\Models\Schedule;
use Illuminate\Support\Facades\Auth;

class StoreAction
{
    protected Schedule $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function __invoke(StoreScheduleRequest $validated): Schedule
    {
        $admin = Auth::user();
        $adminId = $admin->id;

        // スケジュールの作成
        $createdSchedule = $this->schedule->create([
            'admin_id' => $adminId,
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'class_name' => $validated['class_name'],
        ]);

        return $createdSchedule;
    }
}
