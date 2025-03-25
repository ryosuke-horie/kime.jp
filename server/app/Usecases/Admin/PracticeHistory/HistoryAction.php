<?php

namespace App\Usecases\Admin\PracticeHistory;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class HistoryAction
{
    protected User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function __invoke()
    {
        // 認証済み管理者（ジム）を取得
        $admin = Auth::guard()->user();
        $adminId = $admin->id;

        // 管理者に関連するユーザーを取得し、練習回数のトータルと直近1週間の練習回数をカウント
        $users = $this
            ->user
            ->where('admin_id', $adminId)
            // 練習回数のトータルをカウント
            ->withCount('practiceHistories')
            // 直近1週間の練習回数をカウント
            ->withCount(['practiceHistories as practice_histories_last_week_count' => function ($query) {
                $query->where('created_at', '>=', Carbon::now()->subWeek());
            }])
            // 練習記録とスケジュールを同時に取得（最新3件）
            ->with([
                'practiceHistories' => function ($query) {
                    $query->orderBy('created_at', 'desc')
                        ->limit(3)
                        ->with('schedule');
                },
                'userImages', // ユーザーの画像を取得
            ])
            ->get();

        return $users;
    }
}
