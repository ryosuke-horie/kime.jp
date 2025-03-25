<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminRequest;
use App\Http\Resources\AdminResource;
use App\Usecases\Admin\Admin\StoreAction;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    protected StoreAction $storeAction;

    /**
     * コンストラクタでStoreActionを注入
     */
    public function __construct(StoreAction $storeAction)
    {
        $this->storeAction = $storeAction;
    }

    /**
     * 管理者（ジム）を作成する
     */
    public function store(StoreAdminRequest $request): JsonResponse
    {
        // Usecaseを使用して管理者（ジム）を作成
        $admin = $this->storeAction->execute($request);

        // リソースを使用してレスポンスを整形
        return response()->json([
            'message' => 'ジムの登録に成功しました',
            'admin' => new AdminResource($admin),
        ], 201);
    }
}
