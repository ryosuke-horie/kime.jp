<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventAttendance extends Model
{
    use HasFactory;

    /**
     * ホワイトリストの設定
     *
     * @var array
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'responded_at',
    ];

    /**
     * リレーションシップ: 所属するイベント
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * リレーションシップ: 回答したユーザー
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
