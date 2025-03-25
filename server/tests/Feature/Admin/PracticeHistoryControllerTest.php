<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\PracticeHistory;
use App\Models\Schedule;
use App\Models\User;
use App\Models\UserImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PracticeHistoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_admin_can_get_users_with_practice_histories_and_images()
    {
        // テスト用データの作成

        // 管理者を作成
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        // 管理者に関連するユーザーを複数作成
        $users = User::factory()->count(3)->create([
            'admin_id' => $admin->id,
        ]);

        // 各ユーザーに対して練習履歴と画像を作成
        foreach ($users as $user) {
            // 練習履歴を作成
            $practiceHistories = PracticeHistory::factory()->count(5)->create([
                'user_id' => $user->id,
                'created_at' => now()->subDays(rand(1, 14)),
            ]);

            // スケジュールを作成し、練習履歴に関連付け
            $schedule = Schedule::factory()->create([
                'admin_id' => $admin->id,
            ]);

            $practiceHistories->each(function ($history) use ($schedule) {
                $history->schedule_id = $schedule->id;
                $history->save();
            });

            // ユーザー画像を作成
            UserImage::factory()->create([
                'user_id' => $user->id,
                'image_path' => 'user_images/sample.jpg',
            ]);
        }

        // 認証情報を設定
        $token = $admin->createToken('auth_token')->plainTextToken;

        // APIリクエストを送信
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/histories');

        // レスポンスの検証
        $response->assertStatus(200);

        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'admin_id',
                'email',
                'phone',
                'total_practice_count',
                'last_week_practice_count',
                'average_practice_per_week',
                'practice_histories' => [
                    '*' => [
                        'id',
                        'user_id',
                        'schedule_id',
                        'created_at',
                        'updated_at',
                        'schedule' => [
                            'id',
                            'admin_id',
                            'day_of_week',
                            'start_time',
                            'end_time',
                            'class_name',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                ],
                'images' => [
                    '*' => [
                        'id',
                        'image_url',
                    ],
                ],
                'created_at',
            ],
        ]);

        // データの内容を検証（例として最初のユーザーを確認）
        $responseData = $response->json();

        $this->assertCount(3, $responseData);

        $firstUser = $responseData[0];
        $this->assertEquals($users[0]->id, $firstUser['id']);
        $this->assertEquals($users[0]->name, $firstUser['name']);
        $this->assertEquals($users[0]->email, $firstUser['email']);
        $this->assertEquals($users[0]->phone, $firstUser['phone']);

        // 画像のURLが正しく生成されているか確認
        $this->assertNotEmpty($firstUser['images']);
        $this->assertStringContainsString('user_images/sample.jpg', $firstUser['images'][0]['image_url']);

        // 練習履歴が含まれているか確認
        $this->assertNotEmpty($firstUser['practice_histories']);
        $this->assertCount(3, $firstUser['practice_histories']); // 最新3件のみ

        // 平均練習回数が計算されているか確認
        $this->assertArrayHasKey('average_practice_per_week', $firstUser);
    }

    public function test_unauthenticated_user_cannot_access_histories()
    {
        // 認証されていない状態でAPIリクエストを送信
        $response = $this->getJson('/api/admin/histories');

        // 認証エラーを確認
        $response->assertStatus(401);
    }
}
