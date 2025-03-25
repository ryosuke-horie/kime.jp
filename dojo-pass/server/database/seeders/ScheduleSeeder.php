<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
        $classNames = ['キックボクシング', '柔術', 'ガールズクラス'];

        $schedules = [];

        foreach ($daysOfWeek as $day) {
            for ($i = 0; $i < 5; $i++) {
                $startTime = Carbon::createFromTime(10 + $i * 3, 0, 0); // 10:00, 13:00, 16:00, 19:00, 22:00
                $endTime = $startTime->copy()->addHours(1)->addMinutes(30); // 終了時間は開始時間から1.5時間後

                $schedules[] = [
                    'admin_id' => 1, // すべて同じ管理者に設定
                    'day_of_week' => $day,
                    'start_time' => $startTime->toTimeString(),
                    'end_time' => $endTime->toTimeString(),
                    'class_name' => $classNames[$i % count($classNames)],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];
            }
        }

        DB::table('schedules')->insert($schedules);
    }
}
