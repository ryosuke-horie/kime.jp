<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    /**
     * 認可
     * 管理者かどうかミドルウェアでチェックしているため、ここではtrueを返す
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * リクエストのバリデーションルール
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'event_date' => 'required|date_format:Y-m-d H:i:s',
            'deadline' => 'required|date_format:Y-m-d H:i:s',
            'content' => 'required|string',
            'notify_by_email' => 'required',
        ];
    }

    /**
     * バリデーションエラーメッセージのカスタマイズ。
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'title.string' => 'タイトルは文字列でなければなりません。',
            'title.max' => 'タイトルは255文字以下でなければなりません。',
            'event_date.required' => 'イベント日時は必須です。',
            'event_date.date_format' => 'イベント日時は正しい日時形式（例: 2021-01-01 14:00:00）でなければなりません。',
            'deadline.required' => '申込締切日時は必須です。',
            'deadline.date_format' => '申込締切日時は正しい日時形式（例: 2021-01-01 14:00:00）でなければなりません。',
            'content.required' => '内容は必須です。',
            'content.string' => '内容は文字列でなければなりません。',
            'notify_by_email.required' => 'メール通知は必須です。',
        ];
    }
}
