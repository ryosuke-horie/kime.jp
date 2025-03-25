<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ScheduleControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * スケジュール表示エンドポイントが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_admin_can_show_schedules()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // 曜日の配列
        $daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

        // 各曜日にスケジュールを作成
        $schedules = collect($daysOfWeek)->map(function ($day) use ($admin) {
            return Schedule::factory()->create([
                'admin_id' => $admin->id,
                'day_of_week' => $day,
            ]);
        });

        // エンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/admin/schedules');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスのJSON構造を確認
        $response->assertJsonStructure([
            '月曜日',
            '火曜日',
            '水曜日',
            '木曜日',
            '金曜日',
            '土曜日',
            '日曜日',
        ]);

        // 実際のスケジュールデータがレスポンスに含まれていることを確認
        foreach ($schedules as $schedule) {
            $response->assertJsonFragment([
                'id' => $schedule->id,
                'admin_id' => $admin->id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'class_name' => $schedule->class_name,
            ]);
        }
    }

    /**
     * スケジュール登録エンドポイントが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_admin_can_store_schedule()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // スケジュールデータ
        $data = [
            'day_of_week' => '火曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'ヨガクラス',
        ];

        // エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/admin/schedules', $data);

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスのJSON構造を確認
        $response->assertJsonStructure([
            'id',
            'admin_id',
            'day_of_week',
            'start_time',
            'end_time',
            'class_name',
            'created_at',
            'updated_at',
        ]);

        // データベースにスケジュールが存在することを確認
        $this->assertDatabaseHas('schedules', [
            'admin_id' => $admin->id,
            'day_of_week' => '火曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'ヨガクラス',
        ]);
    }

    /**
     * スケジュール削除エンドポイントが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_admin_can_destroy_schedule()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // スケジュールを作成
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
        ]);

        // エンドポイントにDELETEリクエストを送信
        $response = $this->deleteJson("/api/admin/schedules/{$schedule->id}");

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // データベースからスケジュールが削除されたことを確認
        $this->assertDatabaseMissing('schedules', [
            'id' => $schedule->id,
        ]);
    }

    /**
     * スケジュール更新エンドポイントが正常に動作することを確認する。
     *
     * @return void
     */
    public function test_admin_can_update_schedule()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // スケジュールを作成
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '水曜日',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'class_name' => 'ピラティスクラス',
        ]);

        // 更新データ
        $data = [
            'day_of_week' => '木曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'フィットネスクラス',
        ];

        // エンドポイントにPOSTリクエストを送信（updateはPOSTメソッドを使用）
        $response = $this->postJson("/api/admin/schedules/{$schedule->id}", $data);

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // スケジュールを再取得してupdated_atを取得
        $updatedSchedule = Schedule::find($schedule->id);

        // レスポンスに更新されたスケジュールが含まれていることを確認
        $response->assertJson([
            'id' => $schedule->id,
            'admin_id' => $admin->id,
            'day_of_week' => '木曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'フィットネスクラス',
            'created_at' => $schedule->created_at->toISOString(),
            'updated_at' => $updatedSchedule->updated_at->toISOString(),
        ]);

        // データベースに更新が反映されていることを確認
        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'day_of_week' => '木曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'フィットネスクラス',
        ]);
    }

    /**
     * 存在しないスケジュールを削除しようとした場合にエラーが発生することを確認する。
     *
     * @return void
     */
    public function test_destroy_nonexistent_schedule()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // 存在しないスケジュールID
        $nonExistentId = 9999;

        // エンドポイントにDELETEリクエストを送信
        $response = $this->deleteJson("/api/admin/schedules/{$nonExistentId}");

        // ステータスコードが404であることを確認
        $response->assertStatus(404);
        // レスポンスのメッセージを確認
        $response->assertJson([
            'message' => '指定されたスケジュールが見つかりません。',
        ]);
    }

    /**
     * 管理者以外のユーザーがスケジュールエンドポイントにアクセスできないことを確認する。
     *
     * @return void
     */
    public function test_non_admin_user_cannot_manage_schedules()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 一般ユーザーを作成し、管理者に関連付け
        $user = User::factory()->create([
            'password' => 'password123',
            'admin_id' => $admin->id,
        ]);

        // ユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // スケジュールデータ
        $data = [
            'day_of_week' => '火曜日',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'class_name' => 'ヨガクラス',
        ];

        // エンドポイントにPOSTリクエストを送信（スケジュール登録）
        $responseStore = $this->postJson('/api/admin/schedules', $data);

        // ステータスコードが403（Forbidden）であることを確認
        $responseStore->assertStatus(403);

        // エラーメッセージが含まれていることを確認
        $responseStore->assertJson([
            'message' => 'Invalid ability provided.',
        ]);

        // スケジュールの表示エンドポイントにGETリクエストを送信
        $responseShow = $this->getJson('/api/admin/schedules');

        // ステータスコードが403（Forbidden）であることを確認
        $responseShow->assertStatus(403);

        // エラーメッセージが含まれていることを確認
        $responseShow->assertJson([
            'message' => 'Invalid ability provided.',
        ]);
    }
}
