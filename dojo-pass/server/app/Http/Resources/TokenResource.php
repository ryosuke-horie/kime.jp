<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TokenResource extends JsonResource
{
    /**
     * リソースのラップを無効化
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * レスポンスの配列形式を定義
     */
    public function toArray($request)
    {
        return [
            'token' => $this->token,
        ];
    }
}
