<?php

namespace Tests\Feature\Admin;

use App\Mail\AdminNotificationMail;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ContactMembersControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected $memberUsers;

    protected function setUp(): void
    {
        parent::setUp();

        // ジムを作成
        $this->adminUser = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        // ジムに関連する会員ユーザーを複数作成
        $this->memberUsers = User::factory()->count(3)->create([
            'admin_id' => $this->adminUser->id,
        ]);
    }

    #[Test]
    public function ジムは全会員にメールを正常に送信できる()
    {
        // Mailファサードをフェイクして実際のメール送信を防止
        Mail::fake();

        // 送信するメッセージを準備
        $payload = [
            'message' => 'これは全会員へのテストメッセージです。',
        ];

        // ジムとしてリクエストを送信
        $response = $this->actingAs($this->adminUser, 'web')
            ->postJson('/api/admin/contact-members', $payload);

        // レスポンスが200ステータスであることを確認
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'メールが正常に送信されました。',
            ]);

        // 各会員に対してメールが送信されたことを確認
        foreach ($this->memberUsers as $member) {
            Mail::assertSent(AdminNotificationMail::class, function ($mail) use ($member, $payload) {
                return $mail->hasTo($member->email) && $mail->messageContent === $payload['message'];
            });
        }
    }

    #[Test]
    public function メール送信時に例外が発生した場合はエラーレスポンスを返す()
    {
        // Mailファサードをモックして送信時に例外を投げるように設定
        Mail::shouldReceive('to->send')
            ->andThrow(new \Exception('SMTPサーバーに接続できません'));

        // 送信するメッセージを準備
        $payload = [
            'message' => 'これは全会員へのテストメッセージです。',
        ];

        // ジムとしてリクエストを送信
        $response = $this->actingAs($this->adminUser, 'web')
            ->postJson('/api/admin/contact-members', $payload);

        // レスポンスが500ステータスであることを確認
        $response->assertStatus(500)
            ->assertJson([
                'message' => 'メール送信に失敗しました。',
            ]);
    }

    #[Test]
    public function 認証されていないユーザーはメール送信機能にアクセスできない()
    {
        // 送信するメッセージを準備
        $payload = [
            'message' => 'これは全会員へのテストメッセージです。',
        ];

        // 認証なしでリクエストを送信
        $response = $this->postJson('/api/admin/contact-members', $payload);

        // レスポンスが401ステータスであることを確認
        $response->assertStatus(401);
    }

    #[Test]
    public function メッセージフィールドは必須である()
    {
        // ジムとしてリクエストを送信（メッセージなし）
        $response = $this->actingAs($this->adminUser, 'web')
            ->postJson('/api/admin/contact-members', []);

        // レスポンスが422ステータスであることを確認し、バリデーションエラーを確認
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }
}
