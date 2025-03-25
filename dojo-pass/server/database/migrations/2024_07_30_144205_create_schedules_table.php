<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSchedulesTable extends Migration
{
    /**
     * マイグレーションを実行する
     *
     * @return void
     */
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id(); // 自動インクリメントのID
            $table->unsignedBigInteger('admin_id'); // 管理者のID
            $table->enum('day_of_week', ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']);
            $table->time('start_time'); // 開始時間
            $table->time('end_time'); // 終了時間
            $table->string('class_name'); // クラス名
            $table->timestamps(); // 作成日時と更新日時

            // 外部キー制約
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }

    /**
     * マイグレーションをロールバックする
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('schedules');
    }
}
