<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\SignupRequest;
use App\Models\User;
use App\Models\UserImage;
use Illuminate\Support\Facades\Hash;

class SignupController extends Controller
{
    /**
     * ユーザーの新規登録
     */
    public function signup(SignupRequest $request): \Illuminate\Http\JsonResponse
    {
        // バリデーション済みのデータを取得
        $data = $request->validated();

        // パスワードをハッシュ化
        $data['password'] = Hash::make($data['password']);

        // ユーザーを作成する
        $user = User::create($data);

        // 画像がアップロードされている場合
        if ($request->hasFile('image')) {
            // 画像をストレージに保存
            $path = $request->file('image')->store('user_images', 's3');

            // UserImageモデルを作成
            $userImage = new UserImage([
                'image_path' => $path,
            ]);

            // ユーザーに画像を関連付け
            $user->userImages()->save($userImage);
        }

        // ユーザー登録に成功したらステータスコード200を返す
        return response()->json($user, 200);
    }
}
