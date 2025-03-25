<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventAttendanceFactory extends Factory
{
    protected $model = EventAttendance::class;

    public function definition()
    {
        $status = $this->faker->randomElement(['参加', '不参加', '未回答']);

        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'status' => $status,
            'responded_at' => $status !== '未回答' ? $this->faker->dateTime : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
