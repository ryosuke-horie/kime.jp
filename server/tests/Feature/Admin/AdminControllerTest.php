<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 正常なリクエストでジム（管理者）が正常に作成されることを確認する。
     *
     * @return void
     */
    public function test_admin_can_be_created_with_valid_data()
    {
        // 正しいAPIキー
        $apiKey = '#Hh29899958';

        // テスト用のリクエストデータ
        $data = [
            'name' => 'Test Gym',
            'email' => 'testgym@example.com',
            'password' => 'securepassword',
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $apiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが201であることを確認
        $response->assertStatus(201);

        // レスポンスのJSON構造を確認
        $response->assertJsonStructure([
            'message',
            'admin' => [
                'id',
                'name',
                'email',
                'created_at',
                'updated_at',
            ],
        ]);

        // データベースに管理者が存在することを確認
        $this->assertDatabaseHas('admins', [
            'email' => 'testgym@example.com',
            'name' => 'Test Gym',
        ]);

        // パスワードがハッシュ化されていることを確認
        $admin = Admin::where('email', 'testgym@example.com')->first();
        $this->assertTrue(Hash::check('securepassword', $admin->password));
    }

    /**
     * 不正なAPIキーが提供された場合、エラーが返されることを確認する。
     *
     * @return void
     */
    public function test_invalid_api_key_returns_validation_error()
    {
        // 不正なAPIキー
        $invalidApiKey = 'invalid_key';

        // テスト用のリクエストデータ
        $data = [
            'name' => 'Test Gym',
            'email' => 'testgym@example.com',
            'password' => 'securepassword',
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $invalidApiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが422（Unprocessable Entity）であることを確認
        $response->assertStatus(422);

        // エラーメッセージを確認
        $response->assertJsonValidationErrors(['token']);
        $response->assertJsonFragment([
            'token' => ['トークンが正しくありません'],
        ]);
    }

    /**
     * 必須フィールドが欠けている場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_missing_required_fields_returns_validation_errors()
    {
        // 正しいAPIキー
        $apiKey = '#Hh29899958';

        // 欠けているフィールド（例: email）
        $data = [
            'name' => 'Test Gym',
            // 'email' => 'testgym@example.com', // 欠けている
            'password' => 'securepassword',
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $apiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // エラーメッセージを確認
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * 無効なメール形式の場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_invalid_email_format_returns_validation_error()
    {
        // 正しいAPIキー
        $apiKey = '#Hh29899958';

        // 無効なメール形式
        $data = [
            'name' => 'Test Gym',
            'email' => 'invalid-email-format',
            'password' => 'securepassword',
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $apiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // エラーメッセージを確認
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * 重複するメールアドレスの場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_duplicate_email_returns_validation_error()
    {
        // 正しいAPIキー
        $apiKey = '#Hh29899958';

        // 既に存在する管理者を作成
        Admin::create([
            'name' => 'Existing Gym',
            'email' => 'existinggym@example.com',
            'password' => Hash::make('password123'),
        ]);

        // 重複するメールアドレス
        $data = [
            'name' => 'New Gym',
            'email' => 'existinggym@example.com', // 重複
            'password' => 'newsecurepassword',
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $apiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // エラーメッセージを確認
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * パスワードが短すぎる場合、バリデーションエラーが返されることを確認する。
     *
     * @return void
     */
    public function test_short_password_returns_validation_error()
    {
        // 正しいAPIキー
        $apiKey = '#Hh29899958';

        // 短すぎるパスワード
        $data = [
            'name' => 'Test Gym',
            'email' => 'testgym@example.com',
            'password' => 'short', // 8文字未満
        ];

        // APIエンドポイントにPOSTリクエストを送信
        $response = $this->withHeaders([
            'x-api-Key' => $apiKey,
            'Accept' => 'application/json',
        ])->postJson('/api/create', $data);

        // ステータスコードが422であることを確認
        $response->assertStatus(422);

        // エラーメッセージを確認
        $response->assertJsonValidationErrors(['password']);
    }
}
