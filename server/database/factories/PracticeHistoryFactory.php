<?php

namespace Database\Factories;

use App\Models\PracticeHistory;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PracticeHistoryFactory extends Factory
{
    /**
     * Illuminate\Database\Eloquent\Factories\Factory<App\Models\PracticeHistory>
     */
    protected $model = PracticeHistory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 曜日の配列
        $daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

        return [
            'user_id' => User::factory(), // 関連するUserを自動生成
            'schedule_id' => Schedule::factory(), // 関連するScheduleを自動生成
            'class_name' => $this->faker->words(3, true),
            'day_of_week' => $this->faker->randomElement($daysOfWeek),
            'start_time' => $this->faker->time('H:i'),
            'end_time' => function (array $attributes) {
                // start_timeの後の時間を生成
                return date('H:i', strtotime($attributes['start_time']) + rand(3600, 7200)); // 1〜2時間後
            },
        ];
    }
}
