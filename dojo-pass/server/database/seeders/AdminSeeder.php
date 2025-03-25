<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 固定の管理者アカウントを作成
        Admin::factory()->create([
            'name' => 'テストジム',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // 追加の管理者をランダムに作成（必要に応じて）
        Admin::factory()->count(5)->create();
    }
}
