<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreAdminRequest extends FormRequest
{
    /**
     * 認可
     * カスタムヘッダーのトークンが正しいか確認する
     *
     * @throws ValidationException
     */
    public function authorize(): bool
    {
        // カスタムヘッダーに設定されたトークンを取得
        $token = $this->header('x-api-Key');

        // トークンが正しいか確認
        if ($token !== '#Hh29899958') {
            throw ValidationException::withMessages([
                'token' => 'トークンが正しくありません',
            ]);
        }

        return true;
    }

    /**
     * リクエストに対するバリデーションルールを取得
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins',
            'password' => 'required|string|min:8',
        ];
    }

    /**
     * バリデーションエラーメッセージを取得
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です。',
            'name.string' => '名前は文字列でなければなりません。',
            'name.max' => '名前は255文字以下でなければなりません。',
            'email.required' => 'メールアドレスは必須です。',
            'email.string' => 'メールアドレスは文字列でなければなりません。',
            'email.email' => '有効なメールアドレスを入力してください。',
            'email.max' => 'メールアドレスは255文字以下でなければなりません。',
            'email.unique' => 'このメールアドレスは既に使用されています。',
            'password.required' => 'パスワードは必須です。',
            'password.string' => 'パスワードは文字列でなければなりません。',
            'password.min' => 'パスワードは最低8文字必要です。',
        ];
    }
}
