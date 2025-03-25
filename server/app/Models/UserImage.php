<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
    ];

    /**
     * ユーザーを取得
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\User, \App\Models\UserImage>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
