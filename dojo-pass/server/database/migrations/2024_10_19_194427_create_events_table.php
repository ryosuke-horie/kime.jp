<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    /**
     * マイグレーションの実行
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id(); // イベントのユニークID
            $table->unsignedBigInteger('admin_id'); // イベントを作成した管理者のID
            $table->string('title', 255); // イベントのタイトル
            $table->dateTime('event_date'); // イベントの開催日時
            $table->dateTime('deadline'); // 参加可否の回答締め切り日時
            $table->text('content')->nullable(); // イベントの詳細・本文
            $table->boolean('notify_by_email')->default(false); // メール通知を希望するか
            $table->timestamps(); // created_at と updated_at

            // 外部キー制約
            $table->foreign('admin_id')
                ->references('id')
                ->on('admins')
                ->onDelete('cascade');
        });
    }

    /**
     * マイグレーションのロールバック
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
