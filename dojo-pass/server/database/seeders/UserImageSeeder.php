<?php

namespace Database\Seeders;

use App\Models\UserImage;
use Illuminate\Database\Seeder;

class UserImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // UserSeederでFactoryを使用してUserを作成するため、ここではUserImageを作成しない
        // DatabaseSeederに登録もしない

        // 固定の画像パスを使用して複数のUserImageを作成
        // UserImage::factory()->count(10)->create([
        //     'image_path' => 'user_images/sample.jpg', // 固定の画像パス
        // ]);
    }
}
