<?php

namespace App\Http\Requests\ContactMembers;

use Illuminate\Foundation\Http\FormRequest;

class ContactMembersRequest extends FormRequest
{
    /**
     * 認可処理
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            'message' => 'required|string',
        ];
    }

    /**
     * カスタムエラーメッセージ
     */
    public function messages(): array
    {
        return [
            'message.required' => 'メッセージは必須です。',
            'message.string' => 'メッセージは文字列でなければなりません。',
        ];
    }
}
