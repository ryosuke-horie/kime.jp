<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'admin_id',
        'email',
        'password',
        'phone',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * ユーザーの画像を取得
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\UserImage>
     */
    public function userImages()
    {
        return $this->hasMany(UserImage::class);
    }

    /**
     * ユーザーの練習記録を取得
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\PracticeHistory>
     */
    public function practiceHistories(): HasMany
    {
        return $this->hasMany(PracticeHistory::class);
    }

    /**
     * ユーザーが所属する管理者を取得
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Admin, \App\Models\User>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
