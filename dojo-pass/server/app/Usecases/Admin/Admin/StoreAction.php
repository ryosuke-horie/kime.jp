<?php

namespace App\Usecases\Admin\Admin;

use App\Http\Requests\Admin\StoreAdminRequest;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class StoreAction
{
    protected Admin $admin;

    /**
     * コンストラクタでAdminモデルを注入
     */
    public function __construct(Admin $admin)
    {
        $this->admin = $admin;
    }

    /**
     * 管理者（ジム）を作成する処理を実行
     */
    public function execute(StoreAdminRequest $request): Admin
    {
        // バリデーション済みのデータを取得
        $validated = $request->validated();

        // パスワードのハッシュ化
        $validated['password'] = Hash::make($validated['password']);

        // 管理者（ジム）の作成
        $admin = $this->admin->create($validated);

        return $admin;
    }
}
