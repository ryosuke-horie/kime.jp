<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Usecases\Admin\PracticeHistory\HistoryAction;

class PracticeHistoryController extends Controller
{
    protected HistoryAction $historyAction;

    /**
     * コンストラクタでHistoryActionを注入
     */
    public function __construct(HistoryAction $historyAction)
    {
        $this->historyAction = $historyAction;
    }

    /**
     * 練習履歴の全件取得
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function histories()
    {
        // Usecaseを使用して練習履歴を取得
        $belongingUsersPlacticeHistories = $this->historyAction->__invoke();

        // Admin専用のUserResourceを使用してデータを整形
        $usersWithHistories = UserResource::collection($belongingUsersPlacticeHistories);

        // レスポンスをJSON形式で返す
        return response()->json($usersWithHistories, 200);
    }
}
