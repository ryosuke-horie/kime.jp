<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Usecases\User\Mypage\ShowAction;
use Illuminate\Http\Request;

class MypageController extends Controller
{
    protected ShowAction $showAction;

    public function __construct(ShowAction $showAction)
    {
        $this->showAction = $showAction;
    }

    /**
     * マイページ表示用データを返却
     *  - ユーザー情報
     *  - 練習記録
     *  - ジムのスケジュール
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $data = $this->showAction->__invoke($request);

        // JSONレスポンスとして返却
        return response()->json($data);
    }
}
