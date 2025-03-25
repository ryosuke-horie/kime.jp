<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    /**
     * ホワイトリストの設定
     *
     * @var array
     */
    protected $fillable = [
        'admin_id',
        'title',
        'event_date',
        'deadline',
        'content',
        'notify_by_email',
    ];

    /**
     * リレーションシップ: イベントを作成したジム
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * リレーションシップ: イベントに紐づくユーザーの参加状況
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function attendances()
    {
        return $this->hasMany(EventAttendance::class);
    }
}
