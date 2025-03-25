<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 正しい資格情報でユーザーがログインできることを確認する。
     *
     * @return void
     */
    public function test_user_can_login_with_correct_credentials()
    {
        // Adminを作成
        $admin = Admin::factory()->create();

        // ユーザーを作成（会員登録）
        $user = User::factory()->create([
            'admin_id' => $admin->id,
            'password' => bcrypt('password123'), // パスワードをハッシュ化
        ]);

        // ログインデータ
        $credentials = [
            'email' => $user->email,
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/user/login', $credentials);

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスにトークンが含まれていることを確認
        $response->assertJsonStructure([
            'token',
        ]);

        // トークンが有効であることを確認
        $this->assertNotEmpty($response->json('token'));
    }

    /**
     * 不正な資格情報でユーザーのログインが失敗することを確認する。
     *
     * @return void
     */
    public function test_user_login_fails_with_incorrect_credentials()
    {
        // Adminを作成
        $admin = Admin::factory()->create();

        // ユーザーを作成（会員登録）
        $user = User::factory()->create([
            'admin_id' => $admin->id,
            'password' => bcrypt('password123'), // パスワードをハッシュ化
        ]);

        // 不正なログインデータ（間違ったパスワード）
        $credentials = [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/user/login', $credentials);

        // ステータスコードが401であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'error' => 'Unauthorized',
        ]);
    }

    /**
     * 存在しないメールアドレスでログインが失敗することを確認する。
     *
     * @return void
     */
    public function test_user_login_fails_with_nonexistent_email()
    {
        // ログインデータ（存在しないメールアドレス）
        $credentials = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/user/login', $credentials);

        // ステータスコードが401であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'error' => 'Unauthorized',
        ]);
    }

    /**
     * メールアドレスとパスワードが不足している場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_user_login_requires_email_and_password()
    {
        // ログインデータ（メールとパスワードが欠けている）
        $credentials = [];

        // ログインリクエストを送信
        $response = $this->postJson('/api/user/login', $credentials);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * 無効なメール形式の場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_user_login_fails_with_invalid_email_format()
    {
        // ログインデータ（無効なメール形式）
        $credentials = [
            'email' => 'invalid-email-format',
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/user/login', $credentials);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * ここから下は管理者ログインのテスト。
     */

    /**
     * 正しい資格情報で管理者がログインできることを確認する。
     *
     * @return void
     */
    public function test_admin_can_login_with_correct_credentials()
    {
        // 管理者を作成（ファクトリを使用）
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // ログインデータ
        $credentials = [
            'email' => $admin->email,
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/admin/login', $credentials);

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスにトークンが含まれていることを確認
        $response->assertJsonStructure([
            'token',
        ]);

        // トークンが有効であることを確認
        $this->assertNotEmpty($response->json('token'));
    }

    /**
     * 不正な資格情報で管理者のログインが失敗することを確認する。
     *
     * @return void
     */
    public function test_admin_login_fails_with_incorrect_credentials()
    {
        // 管理者を作成（ファクトリを使用）
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 不正なログインデータ（間違ったパスワード）
        $credentials = [
            'email' => $admin->email,
            'password' => 'wrongpassword',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/admin/login', $credentials);

        // ステータスコードが401であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'error' => 'Unauthorized',
        ]);
    }

    /**
     * 存在しないメールアドレスでログインが失敗することを確認する。
     *
     * @return void
     */
    public function test_admin_login_fails_with_nonexistent_email()
    {
        // ログインデータ（存在しないメールアドレス）
        $credentials = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/admin/login', $credentials);

        // ステータスコードが401であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'error' => 'Unauthorized',
        ]);
    }

    /**
     * メールアドレスとパスワードが不足している場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_admin_login_requires_email_and_password()
    {
        // ログインデータ（メールとパスワードが欠けている）
        $credentials = [];

        // ログインリクエストを送信
        $response = $this->postJson('/api/admin/login', $credentials);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * 無効なメール形式の場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_admin_login_fails_with_invalid_email_format()
    {
        // ログインデータ（無効なメール形式）
        $credentials = [
            'email' => 'invalid-email-format',
            'password' => 'password123',
        ];

        // ログインリクエストを送信
        $response = $this->postJson('/api/admin/login', $credentials);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // バリデーションエラーが含まれていることを確認
        $response->assertJsonValidationErrors(['email']);
    }
}
