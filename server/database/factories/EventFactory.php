<?php

namespace Database\Factories;

use App\Models\Admin;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition()
    {
        $deadline = $this->faker->dateTimeBetween('+1 days', '+2 days');
        $event_date = $this->faker->dateTimeBetween('+3 days', '+4 days');

        return [
            'admin_id' => Admin::factory(),
            'title' => $this->faker->sentence,
            'event_date' => $event_date,
            'deadline' => $deadline,
            'content' => $this->faker->paragraph,
            'notify_by_email' => $this->faker->boolean,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
