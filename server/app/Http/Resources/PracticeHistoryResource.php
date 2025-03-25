<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $schedule_id
 * @property string $created_at
 * @property string $updated_at
 * @property ScheduleResource $schedule
 */
class PracticeHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'schedule_id' => $this->schedule_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'schedule' => new ScheduleResource($this->whenLoaded('schedule')),
        ];
    }
}
