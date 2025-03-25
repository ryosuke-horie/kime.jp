<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Usecases\User\PracticeHistory\EntryAction;
use App\Usecases\User\PracticeHistory\Exceptions\AlreadyEntryException;
use App\Usecases\User\PracticeHistory\Exceptions\NonExistingScheduleException;

class PracticeHistoryController extends Controller
{
    protected EntryAction $entryAction;

    public function __construct(EntryAction $entryAction)
    {
        $this->entryAction = $entryAction;
    }

    /**
     * 練習記録を登録
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function entry()
    {
        try {
            $practiceHistory = $this->entryAction->__invoke();
        } catch (NonExistingScheduleException $e) {
            return response()->json(['message' => '現在の時間に該当するスケジュールが存在しません'], 404);
        } catch (AlreadyEntryException $e) {
            return response()->json(['message' => '本日のこのクラスには既に登録されています'], 400);
        }

        return response()->json($practiceHistory);
    }
}
