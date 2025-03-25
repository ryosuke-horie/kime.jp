<?php

namespace Tests\Feature\User;

use App\Models\Admin;
use App\Models\PracticeHistory;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MypageControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 認証済みユーザーがマイページにアクセスでき、正しいデータが返されることを確認する。
     *
     * @return void
     */
    public function test_authenticated_user_can_access_mypage_and_receive_correct_data()
    {
        // 管理者を作成
        $admin = Admin::factory()->create();

        // ユーザーを作成（管理者に関連付け）
        $user = User::factory()->create([
            'admin_id' => $admin->id,
            'password' => bcrypt('password123'), // パスワードをハッシュ化
        ]);

        // ユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // 管理者に関連するスケジュールを特定の曜日で作成
        $schedules = Schedule::factory()->count(2)->create([
            'admin_id' => $admin->id,
            'day_of_week' => '月曜日',
        ]);

        $additionalSchedules = Schedule::factory()->count(1)->create([
            'admin_id' => $admin->id,
            'day_of_week' => '火曜日',
        ]);

        // 全てのスケジュールを結合
        $allSchedules = $schedules->concat($additionalSchedules);

        // ユーザーの練習記録を作成（各練習記録にスケジュールを関連付け）
        $practiceHistories = PracticeHistory::factory()->count(5)->create([
            'user_id' => $user->id,
            'schedule_id' => $allSchedules->random()->id,
        ]);

        // マイページエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/user/mypage');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスのJSON構造を確認
        $response->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'admin_id',
                'email',
                'created_at',
                'updated_at',
            ],
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
            'schedules' => [
                '月曜日' => [
                    '*' => [
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
                '火曜日' => [
                    '*' => [
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
        ]);

        // ユーザー情報の検証
        $response->assertJsonFragment([
            'id' => $user->id,
            'name' => $user->name,
            'admin_id' => $admin->id,
            'email' => $user->email,
        ]);

        // 練習記録の検証
        foreach ($practiceHistories as $history) {
            $response->assertJsonFragment([
                'id' => $history->id,
                'user_id' => $user->id,
                'schedule_id' => $history->schedule_id,
            ]);

            // スケジュールの検証
            $schedule = $history->schedule;
            $response->assertJsonFragment([
                'id' => $schedule->id,
                'admin_id' => $schedule->admin_id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'class_name' => $schedule->class_name,
            ]);
        }

        // スケジュールの曜日ごとのグループ化を検証
        foreach ($allSchedules as $schedule) {
            if (in_array($schedule->day_of_week, ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'])) {
                $response->assertJsonFragment([
                    'day_of_week' => $schedule->day_of_week,
                ]);
            }
        }
    }

    /**
     * 認証されていないユーザーがマイページにアクセスできないことを確認する。
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_access_mypage()
    {
        // マイページエンドポイントにGETリクエストを送信（認証なし）
        $response = $this->getJson('/api/user/mypage');

        // ステータスコードが401（Unauthorized）であることを確認
        $response->assertStatus(401);
    }

    /**
     * ユーザーが関連するスケジュールが存在しない場合でもマイページが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_mypage_with_no_schedules()
    {
        // 管理者を作成
        $admin = Admin::factory()->create();

        // ユーザーを作成（管理者に関連付け）
        $user = User::factory()->create([
            'admin_id' => $admin->id,
            'password' => bcrypt('password123'),
        ]);

        // ユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // 練習記録のみ作成（スケジュールは作成しない）
        $practiceHistories = PracticeHistory::factory()->count(3)->create([
            'user_id' => $user->id,
            'schedule_id' => null, // スケジュールがない場合
        ]);

        // マイページエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/user/mypage');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // スケジュールが空であることを確認
        $response->assertJsonFragment([
            'schedules' => [],
        ]);
    }

    /**
     * ユーザーの練習記録が存在しない場合でもマイページが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_mypage_with_no_practice_histories()
    {
        // 管理者を作成
        $admin = Admin::factory()->create();

        // ユーザーを作成（管理者に関連付け）
        $user = User::factory()->create([
            'admin_id' => $admin->id,
            'password' => bcrypt('password123'),
        ]);

        // ユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // 管理者に関連するスケジュールを作成
        $schedules = Schedule::factory()->count(2)->create([
            'admin_id' => $admin->id,
        ]);

        // 練習記録を作成しない

        // マイページエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/user/mypage');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // 練習記録が空であることを確認
        $response->assertJsonFragment([
            'practice_histories' => [],
        ]);

        // スケジュールが存在することを確認
        foreach ($schedules as $schedule) {
            $response->assertJsonFragment([
                'day_of_week' => $schedule->day_of_week,
                'id' => $schedule->id,
                'class_name' => $schedule->class_name,
                // 他のスケジュール属性も必要に応じて追加
            ]);
        }
    }
}
