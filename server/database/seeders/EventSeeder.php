<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // admin_idが1の管理者に対してイベントを3個作成
        Event::factory()->count(3)->create([
            'admin_id' => 1,
        ]);
    }
}
