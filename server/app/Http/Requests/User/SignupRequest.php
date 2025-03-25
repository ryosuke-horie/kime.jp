<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{
    /**
     * ユーザーがこのリクエストを行うことを許可するかどうか
     */
    public function authorize(): bool
    {
        // 必要に応じて認可ロジックを追加
        // 今回はすべてのユーザーに許可
        return true;
    }

    /**
     * リクエストに対するバリデーションルールを取得
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'admin_id' => 'required|exists:admins,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:255',
            'image' => 'nullable|image',
        ];
    }

    /**
     * バリデーションエラーメッセージのカスタマイズ
     */
    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です。',
            'admin_id.required' => '管理者IDは必須です。',
            'admin_id.exists' => '指定された管理者IDは存在しません。',
            'email.required' => 'メールアドレスは必須です。',
            'email.email' => 'メールアドレスの形式が正しくありません。',
            'email.unique' => 'このメールアドレスは既に登録されています。',
            'password.required' => 'パスワードは必須です。',
            'password.min' => 'パスワードは最低8文字必要です。',
        ];
    }
}
