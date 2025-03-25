<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    /**
     * このリクエストが認可されているかどうかを判定します。
     *
     * @return bool
     */
    public function authorize()
    {
        // 管理者かどうかミドルウェアでチェックしているため、ここではtrueを返す
        return true;
    }

    /**
     * リクエストに対するバリデーションルールを取得します。
     *
     * @return array
     */
    public function rules()
    {
        return [
            'day_of_week' => 'required|string|in:月曜日,火曜日,水曜日,木曜日,金曜日,土曜日,日曜日',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'class_name' => 'required|string|max:255',
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
            'day_of_week.required' => '曜日は必須です。',
            'day_of_week.string' => '曜日は文字列でなければなりません。',
            'day_of_week.in' => '曜日は有効な値でなければなりません。',
            'start_time.required' => '開始時間は必須です。',
            'start_time.date_format' => '開始時間は正しい時間形式（例: 14:00）でなければなりません。',
            'end_time.required' => '終了時間は必須です。',
            'end_time.date_format' => '終了時間は正しい時間形式（例: 15:00）でなければなりません。',
            'end_time.after' => '終了時間は開始時間より後でなければなりません。',
            'class_name.required' => 'クラス名は必須です。',
            'class_name.string' => 'クラス名は文字列でなければなりません。',
            'class_name.max' => 'クラス名は255文字以下でなければなりません。',
        ];
    }
}
