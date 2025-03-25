<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\PracticeHistoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name
 * @property int $admin_id
 * @property string $email
 * @property string $created_at
 * @property int $practice_histories_count
 * @property int $practice_histories_last_week_count
 * @property \Illuminate\Database\Eloquent\Collection $practiceHistories
 * @property \Illuminate\Database\Eloquent\Collection $userImages
 */
class UserResource extends JsonResource
{
    /**
     * リソースのラップを無効化
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // 現在の日付とユーザーの登録日を取得
        $now = Carbon::now();
        $registrationDate = Carbon::parse($this->created_at);

        // 登録日からの総日数を計算
        $daysSinceRegistration = $registrationDate->diffInDays($now);

        // 総週数を計算（少なくとも1週間とする）
        $weeksSinceRegistration = max(1, $daysSinceRegistration / 7);

        // 1週間あたりの平均練習回数を計算
        $averagePracticePerWeek = round($this->practice_histories_count / $weeksSinceRegistration, 2);

        // ユーザーの画像情報を取得
        $images = $this->userImages->map(function ($image) {
            return [
                'id' => $image->id,
                'image_url' => Storage::disk('s3')->url($image->image_path), // 画像のURL
            ];
        })->values(); // インデックスをリセット

        return [
            'id' => $this->id,
            'name' => $this->name,
            'admin_id' => $this->admin_id,
            'email' => $this->email,
            'phone' => $this->phone,
            'total_practice_count' => $this->practice_histories_count,
            'last_week_practice_count' => $this->practice_histories_last_week_count,
            'average_practice_per_week' => $averagePracticePerWeek,
            'practice_histories' => PracticeHistoryResource::collection($this->practiceHistories),
            'images' => $images,
            'created_at' => $this->created_at,
        ];
    }
}
