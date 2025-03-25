<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VerifyTokenControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * トークンを持つ管理者がverify-tokenエンドポイントにアクセスできることを確認する。
     *
     * @return void
     */
    public function test_admin_can_verify_token_successfully()
    {
        // 管理者を作成（ファクトリを使用）
        $admin = Admin::factory()->create([
            'password' => 'password123', // パスワードはファクトリ内でハッシュ化されます
        ]);

        // Sanctumを使用して管理者を認証状態にする
        Sanctum::actingAs($admin, ['admin']);

        // verify-tokenエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/admin/verify-token');

        // ステータスコードが200であることを確認
        $response->assertStatus(200);

        // レスポンスに管理者の情報が含まれていることを確認
        $response->assertJson([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
        ]);

        // 不要なフィールドが含まれていないことを確認
        $response->assertJsonMissing([
            'password',
            'remember_token',
        ]);
    }

    /**
     * トークンが無い場合、verify-tokenエンドポイントへのアクセスが拒否されることを確認する。
     *
     * @return void
     */
    public function test_verify_token_fails_without_token()
    {
        // verify-tokenエンドポイントにGETリクエストを送信（認証なし）
        $response = $this->getJson('/api/admin/verify-token');

        // ステータスコードが401（Unauthorized）であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => 'Unauthenticated.',
        ]);
    }

    /**
     * 無効なトークンでverify-tokenエンドポイントへのアクセスが拒否されることを確認する。
     *
     * @return void
     */
    public function test_verify_token_fails_with_invalid_token()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 無効なトークンを使用して認証状態にする
        // ここでは、無効なトークンを直接指定する方法を使用します
        $invalidToken = 'invalid-token-string';

        // verify-tokenエンドポイントにGETリクエストを送信（無効なトークン）
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$invalidToken,
        ])->getJson('/api/admin/verify-token');

        // ステータスコードが401（Unauthorized）であることを確認
        $response->assertStatus(401);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => 'Unauthenticated.',
        ]);
    }

    /**
     * 管理者以外のユーザーがadminのverify-tokenエンドポイントにアクセスできないことを確認する。
     *
     * @return void
     */
    public function test_user_cannot_access_admin_verify_token()
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

        // Sanctumを使用してユーザーを認証状態にする
        Sanctum::actingAs($user, ['user']);

        // adminのverify-tokenエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/admin/verify-token');

        // ステータスコードが403（Forbidden）または401（Unauthorized）であることを確認
        // Sanctumの設定やミドルウェアによって異なります
        $response->assertStatus(403);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => 'Invalid ability provided.',
        ]);
    }

    /**
     * 管理者がverify-tokenエンドポイントに無効なアクション能力でアクセスできないことを確認する。
     *
     * @return void
     */
    public function test_admin_cannot_access_verify_token_with_invalid_abilities()
    {
        // 管理者を作成
        $admin = Admin::factory()->create([
            'password' => 'password123',
        ]);

        // 無効な能力で管理者を認証状態にする
        Sanctum::actingAs($admin, ['invalid-ability']);

        // verify-tokenエンドポイントにGETリクエストを送信
        $response = $this->getJson('/api/admin/verify-token');

        // ステータスコードが403（Forbidden）であることを確認
        $response->assertStatus(403);

        // エラーメッセージが含まれていることを確認
        $response->assertJson([
            'message' => 'Invalid ability provided.',
        ]);
    }
}
