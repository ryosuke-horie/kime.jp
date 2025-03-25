<?php

namespace App\Http\Resources;

use App\Models\Admin;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @extends JsonResource<App\Models\Admin>
 */
class AdminResource extends JsonResource
{
    /**
     * リソースの配列形式を定義します。
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        /** @var Admin $admin */
        $admin = $this->resource;

        return [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'created_at' => $admin->created_at,
            'updated_at' => $admin->updated_at,
        ];
    }
}
