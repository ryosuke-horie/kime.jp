<?php

namespace App\Http\Requests\EventAttendance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventAttendanceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        // statusは「参加」「不参加」のみ許可
        return [
            'status' => 'required|in:参加,不参加',
        ];

    }

    public function messages()
    {
        return [
            'status.required' => '参加可否を選択してください',
            'status.in' => '参加可否は「参加」または「不参加」のみ選択できます',
        ];
    }
}
