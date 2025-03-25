<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'admin_id',
        'day_of_week',
        'start_time',
        'end_time',
        'class_name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * start_timeのアクセサ
     *
     * @param  string  $value
     * @return string
     */
    public function getStartTimeAttribute($value)
    {
        return Carbon::parse($value)->format('H:i');
    }

    /**
     * end_timeのアクセサ
     *
     * @param  string  $value
     * @return string
     */
    public function getEndTimeAttribute($value)
    {
        return Carbon::parse($value)->format('H:i');
    }

    /**
     * このスケジュールに関連する練習記録を取得
     */
    public function practiceHistories(): HasMany
    {
        return $this->hasMany(PracticeHistory::class);
    }

    /**
     * スケジュールを管理する管理者を取得
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
