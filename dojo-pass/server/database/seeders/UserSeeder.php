<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 最初のユーザーを作成（変更なし）
        User::factory()->create([
            'name' => 'テストユーザー',
            'admin_id' => '1',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // 他のユーザーを複数作成
        User::factory()->count(10)->create([
            'admin_id' => '1',
        ]);
    }
}
