<?php

namespace Database\Factories;

use App\Models\Admin;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Admin>
 */
class AdminFactory extends Factory
{
    /**
     * Illuminate\Database\Eloquent\Factories\Factory<App\Models\Admin>
     */
    protected $model = Admin::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company.' Gym',
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'password',
        ];
    }
}
