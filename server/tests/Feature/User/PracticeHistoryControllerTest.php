<?php

namespace Tests\Feature\User;

use App\Models\Admin;
use App\Models\PracticeHistory;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PracticeHistoryControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 認証済みユーザーが練習履歴を正常に登録できることを確認する。
     *
     * @return void
     */
    public function test_user_can_register_practice_history_successfully()
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

        // 特定の曜日と時間にスケジュールを作成（例: 月曜日 10:00-11:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '月曜日',
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'class_name' => 'ヨガクラス',
        ]);

        // 受付開始15分前の時刻を設定 (start_time - 15分 = 09:45)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-04-29 09:45:00')); // 2024-04-29は月曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスのJSON構造を確認
        $response->assertJsonStructure([
            'id',
            'user_id',
            'schedule_id',
            'class_name',
            'day_of_week',
            'start_time',
            'end_time',
            'created_at',
            'updated_at',
        ]);

        // データベースに練習履歴が存在することを確認
        $this->assertDatabaseHas('practice_histories', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'class_name' => 'ヨガクラス',
            'day_of_week' => '月曜日',
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // レスポンスの内容を確認
        $responseData = $response->json();
        $this->assertEquals($user->id, $responseData['user_id']);
        $this->assertEquals($schedule->id, $responseData['schedule_id']);
        $this->assertEquals('ヨガクラス', $responseData['class_name']);
        $this->assertEquals('月曜日', $responseData['day_of_week']);
        $this->assertEquals('10:00', $responseData['start_time']); // 時刻の秒数は含まれない
        $this->assertEquals('11:00', $responseData['end_time']); // 時刻の秒数は含まれない
    }

    /**
     * 練習履歴登録時に該当するスケジュールが存在しない場合、エラーレスポンスが返されることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_fails_when_no_matching_schedule()
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

        // スケジュールを作成しない（該当するスケジュールが存在しない状態）

        // 現在時刻を月曜日の09:30に設定（start_time - 15分以前）
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-04-29 09:30:00')); // 2024-04-29は月曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが404であることを確認
        $response->assertStatus(404);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => '現在の時間に該当するスケジュールが存在しません',
        ]);
    }

    /**
     * 練習履歴登録時に既に同じクラスに本日登録済みの場合、エラーレスポンスが返されることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_fails_when_already_registered_today()
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

        // 特定の曜日と時間にスケジュールを作成（例: 月曜日 10:00-11:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '月曜日',
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'class_name' => 'ヨガクラス',
        ]);

        // 受付開始15分前の時刻を設定 (start_time - 15分 = 09:45)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-04-29 09:45:00')); // 2024-04-29は月曜日

        // 既に練習履歴を登録している状態を作成
        PracticeHistory::factory()->create([
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'class_name' => 'ヨガクラス',
            'day_of_week' => '月曜日',
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが400であることを確認
        $response->assertStatus(400);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => '本日のこのクラスには既に登録されています',
        ]);
    }

    /**
     * 練習履歴登録時に現在の時間がスケジュールの受付時間外である場合、エラーレスポンスが返されることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_fails_when_not_in_schedule_time()
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

        // 特定の曜日と時間にスケジュールを作成（例: 火曜日 14:00-15:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '火曜日',
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
            'class_name' => 'ピラティスクラス',
        ]);

        // 受付終了15分後の時刻を設定 (end_time - 15分 = 14:45)
        // 現在時刻を14:46に設定 (end_time - 15分後)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-04-30 14:46:00')); // 2024-04-30は火曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが404であることを確認
        $response->assertStatus(404);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => '現在の時間に該当するスケジュールが存在しません',
        ]);
    }

    /**
     * 練習履歴登録時にスケジュールが存在しても他の管理者のスケジュールである場合、エラーレスポンスが返されることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_fails_when_schedule_belongs_to_another_admin()
    {
        // 管理者Aを作成
        $adminA = Admin::factory()->create();

        // 管理者Bを作成
        $adminB = Admin::factory()->create();

        // ユーザーを作成（管理者Aに関連付け）
        $user = User::factory()->create([
            'admin_id' => $adminA->id,
            'password' => bcrypt('password123'),
        ]);

        // ユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // 管理者Bに関連するスケジュールを作成
        $schedule = Schedule::factory()->create([
            'admin_id' => $adminB->id,
            'day_of_week' => '水曜日',
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'class_name' => 'ダンスクラス',
        ]);

        // 管理者Bのスケジュール受付開始15分前の時刻を設定 (start_time - 15分 = 08:45)
        // 現在時刻を08:45に設定
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-05-01 08:45:00')); // 2024-05-01は水曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが404であることを確認
        $response->assertStatus(404);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => '現在の時間に該当するスケジュールが存在しません',
        ]);
    }

    /**
     * 受付開始15分前にエントリーできることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_at_start_time_minus_15_minutes()
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

        // スケジュールを作成（例: 木曜日 16:00-17:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '木曜日',
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
            'class_name' => 'ストレッチクラス',
        ]);

        // 受付開始15分前の時刻を設定 (start_time - 15分 = 15:45)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-05-02 15:45:00')); // 2024-05-02は木曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // データベースに練習履歴が存在することを確認
        $this->assertDatabaseHas('practice_histories', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'class_name' => 'ストレッチクラス',
            'day_of_week' => '木曜日',
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
        ]);
    }

    /**
     * 受付終了15分前にエントリーできることを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_at_end_time_minus_15_minutes()
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

        // スケジュールを作成（例: 金曜日 18:00-19:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '金曜日',
            'start_time' => '18:00:00',
            'end_time' => '19:00:00',
            'class_name' => 'ボクシングクラス',
        ]);

        // 受付終了15分前の時刻を設定 (end_time - 15分 = 18:45)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-05-03 18:45:00')); // 2024-05-03は金曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // データベースに練習履歴が存在することを確認
        $this->assertDatabaseHas('practice_histories', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'class_name' => 'ボクシングクラス',
            'day_of_week' => '金曜日',
            'start_time' => '18:00:00',
            'end_time' => '19:00:00',
        ]);
    }

    /**
     * 受付終了15分前を過ぎた場合にエントリーできないことを確認する。
     *
     * @return void
     */
    public function test_register_practice_history_fails_after_end_time_minus_15_minutes()
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

        // スケジュールを作成（例: 日曜日 07:00-08:00）
        $schedule = Schedule::factory()->create([
            'admin_id' => $admin->id,
            'day_of_week' => '日曜日',
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'class_name' => 'エアロビクスクラス',
        ]);

        // 受付終了15分後の時刻を設定 (end_time - 15分 +1分 =07:46)
        Carbon::setTestNow(Carbon::createFromFormat('Y-m-d H:i:s', '2024-05-05 07:46:00')); // 2024-05-05は日曜日

        // 練習履歴登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/entry');

        // ステータスコードが404であることを確認
        $response->assertStatus(404);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => '現在の時間に該当するスケジュールが存在しません',
        ]);
    }
}
