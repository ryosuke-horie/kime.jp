<?php

namespace Database\Seeders;

use App\Models\PracticeHistory;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;

final class PracticeHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 全ユーザーを取得
        $users = User::all();
        $schedules = Schedule::all();

        $practiceHistories = [];

        foreach ($users as $user) {
            foreach (range(1, 3) as $i) {
                $schedule = $schedules->random();

                $practiceHistories[] = [
                    'user_id' => $user->id,
                    'schedule_id' => $schedule->id,
                    'class_name' => $schedule->class_name,
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        PracticeHistory::insert($practiceHistories);
    }
}
