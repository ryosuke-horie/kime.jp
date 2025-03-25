<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 全てのイベントを取得
        $events = Event::all();

        // 各イベントに対してランダムに出欠状況を設定
        foreach ($events as $event) {
            // 参加者をランダムに選択（例: 全ユーザーの50%）
            $users = User::inRandomOrder()->take(rand(20, 50))->get();

            foreach ($users as $user) {
                EventAttendance::factory()->create([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'status' => $this->getRandomStatus(),
                ]);
            }
        }
    }

    /**
     * ランダムな出欠状況を返す
     *
     * @return string
     */
    private function getRandomStatus()
    {
        $statuses = ['参加', '不参加', '未回答'];

        return $statuses[array_rand($statuses)];
    }
}
