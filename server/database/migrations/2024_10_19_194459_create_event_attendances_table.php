<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventAttendancesTable extends Migration
{
    /**
     * マイグレーションの実行
     *
     * @return void
     */
    public function up()
    {
        Schema::create('event_attendances', function (Blueprint $table) {
            $table->id(); // 参加状況レコードのユニークID
            $table->unsignedBigInteger('event_id'); // 対象のイベントID
            $table->unsignedBigInteger('user_id'); // 回答したユーザーのID
            $table->enum('status', ['参加', '不参加', '未回答'])->default('未回答'); // 参加状況
            $table->timestamp('responded_at')->nullable(); // ユーザーが回答した日時
            $table->timestamps(); // created_at と updated_at

            // 外部キー制約
            $table->foreign('event_id')
                ->references('id')
                ->on('events')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            // ユニーク制約（各ユーザーは各イベントに一度だけ回答可能）
            $table->unique(['event_id', 'user_id']);
        });
    }

    /**
     * マイグレーションのロールバック
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('event_attendances');
    }
}
