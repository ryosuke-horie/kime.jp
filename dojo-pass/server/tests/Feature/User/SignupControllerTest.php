<?php

namespace Tests\Feature\User;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SignupControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 正常なデータで会員登録が成功することを確認する。
     *
     * @return void
     */
    public function test_user_can_signup_with_valid_data()
    {
        // Adminを作成
        $admin = Admin::factory()->create();

        // 会員登録データ
        $data = [
            'name' => 'テストユーザー',
            'admin_id' => $admin->id,
            'email' => 'testuser@example.com',
            'password' => 'securepassword',
            'phone' => '09012345678',
        ];

        // 会員登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/signup', $data);

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスにユーザーのデータが含まれていることを確認
        $response->assertJson([
            'name' => 'テストユーザー',
            'admin_id' => $admin->id,
            'email' => 'testuser@example.com',
            // 'password' フィールドは返されないことが望ましい
        ]);

        // パスワードがハッシュ化されていることを確認
        $this->assertDatabaseHas('users', [
            'email' => 'testuser@example.com',
        ]);

        $user = User::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('securepassword', $user->password));
    }

    /**
     * 既に登録されているメールアドレスで会員登録を試みた場合、エラーが返されることを確認する。
     *
     * @return void
     */
    public function test_signup_fails_with_duplicate_email()
    {
        // Adminを作成
        $admin = Admin::factory()->create();

        // 既に登録されているユーザーを作成
        $existingUser = User::factory()->create([
            'email' => 'duplicate@example.com',
            'admin_id' => $admin->id,
        ]);

        // 会員登録データ（既存のメールアドレスを使用）
        $data = [
            'name' => '新規ユーザー',
            'admin_id' => $admin->id,
            'email' => 'duplicate@example.com',
            'password' => 'newpassword',
        ];

        // 会員登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/signup', $data);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email']);

        // カスタムバリデーションメッセージを確認（オプション）
        $response->assertJsonFragment([
            'errors' => [
                'email' => ['このメールアドレスは既に登録されています。'],
            ],
        ]);
    }

    /**
     * 必須フィールドが欠如している場合、会員登録が失敗することを確認する。
     *
     * @return void
     */
    public function test_signup_fails_with_missing_fields()
    {
        // 必須フィールドの一部が欠如しているデータ
        $data = [
            'name' => 'ユーザー名',
            // 'admin_id' が欠如
            'email' => 'user@example.com',
            // 'password' が欠如
        ];

        // 会員登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/signup', $data);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['admin_id', 'password']);
    }

    /**
     * 無効なメールアドレス形式で会員登録を試みた場合、エラーが返されることを確認する。
     *
     * @return void
     */
    public function test_signup_fails_with_invalid_email_format()
    {
        // Adminを作成
        $admin = Admin::factory()->create();

        // 会員登録データ（無効なメール形式）
        $data = [
            'name' => 'テストユーザー',
            'admin_id' => $admin->id,
            'email' => 'invalid-email-format',
            'password' => 'securepassword',
        ];

        // 会員登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/signup', $data);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * 無効な `admin_id` で会員登録を試みた場合、エラーが返されることを確認する。
     *
     * @return void
     */
    public function test_signup_fails_with_invalid_admin_id()
    {
        // 無効な `admin_id` を使用
        $invalidAdminId = 9999;

        // 会員登録データ
        $data = [
            'name' => 'テストユーザー',
            'admin_id' => $invalidAdminId,
            'email' => 'testuser@example.com',
            'password' => 'securepassword',
        ];

        // 会員登録エンドポイントにPOSTリクエストを送信
        $response = $this->postJson('/api/user/signup', $data);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['admin_id']);
    }
}
