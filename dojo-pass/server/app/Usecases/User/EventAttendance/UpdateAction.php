<?php

namespace App\Usecases\User\EventAttendance;

use App\Models\EventAttendance;
use Illuminate\Support\Facades\Auth;

class UpdateAction
{
    protected EventAttendance $eventAttendance;

    public function __construct(EventAttendance $eventAttendance)
    {
        $this->eventAttendance = $eventAttendance;
    }

    public function __invoke($request, $eventId)
    {
        // tokenからユーザーを取得
        $user = Auth::user();
        // ユーザーIDを取得
        $userId = $user->id;

        try {
            // updateOrCreateを使用して、存在すれば更新、なければ作成
            $attendance = EventAttendance::updateOrCreate(
                [
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                ],
                [
                    'status' => $request->status,
                    'responded_at' => now(),
                ]
            );

            return response()->json([
                'message' => '参加可否の回答を更新しました。',
                'attendance' => $attendance,
            ], 200);
        } catch (\Exception $e) {
            // エラーハンドリング
            return response()->json([
                'message' => '参加可否の回答の更新に失敗しました。',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
