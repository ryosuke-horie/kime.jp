<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventAttendance\UpdateEventAttendanceRequest;
use App\Usecases\User\EventAttendance\UpdateAction;

class EventAttendanceController extends Controller
{
    protected UpdateAction $updateAction;

    public function __construct(UpdateAction $updateAction)
    {
        $this->updateAction = $updateAction;
    }

    /**
     * イベントへの参加可否を更新
     */
    public function update(UpdateEventAttendanceRequest $request, $id)
    {
        $response = $this->updateAction->__invoke($request, $id);

        return response()->json($response);
    }
}
