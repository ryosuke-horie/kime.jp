<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'admin_id' => 1, // 固定された管理者IDに関連付け
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt('password'), // パスワードをハッシュ化
            'phone' => $this->faker->phoneNumber(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Configure the factory.
     */
    public function configure()
    {
        return $this->afterCreating(function (User $user) {
            // 固定の画像パスでUserImageを作成
            UserImage::factory()->create([
                'user_id' => $user->id,
                'image_path' => 'user_images/sample.jpg', // 固定の画像パス
            ]);
        });
    }
}
