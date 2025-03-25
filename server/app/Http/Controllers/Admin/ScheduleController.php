<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreScheduleRequest;
use App\Http\Requests\Schedule\UpdateScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Usecases\Admin\Schedule\DeleteAction;
use App\Usecases\Admin\Schedule\Exceptions\NonExistingScheduleException;
use App\Usecases\Admin\Schedule\ShowAction;
use App\Usecases\Admin\Schedule\StoreAction;
use App\Usecases\Admin\Schedule\UpdateAction;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    protected showAction $showAction;

    public function __construct(
        ShowAction $showAction,
        StoreAction $storeAction,
        DeleteAction $deleteAction,
        UpdateAction $updateAction
    ) {
        $this->showAction = $showAction;
        $this->storeAction = $storeAction;
        $this->deleteAction = $deleteAction;
        $this->updateAction = $updateAction;
    }

    /**
     * スケジュール表示
     * ジムに紐づくスケジュールを取得
     */
    public function show(): JsonResponse
    {
        // スケジュール表示用のデータを取得
        // 曜日ごとにスケジュールをグループ化
        // 開始時間順にソート
        $schedulesGrouped = $this->showAction->__invoke();

        return response()->json($schedulesGrouped);
    }

    /**
     * スケジュール登録
     * ジムにスケジュールを登録
     */
    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $createdSchedule = $this->storeAction->__invoke($request);

        return response()->json($createdSchedule, 200);
    }

    /**
     * スケジュール削除
     * ジムに紐づくスケジュールを削除
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteAction->__invoke($id);
        } catch (NonExistingScheduleException $e) {
            return response()->json([
                'message' => '指定されたスケジュールが見つかりません。',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'スケジュールの削除に失敗しました。',
            ], 500);
        }

        // 例外が発生しなければ、ステータスコード200を返す
        return response()->json([], 200);
    }

    /**
     * スケジュール更新
     * ジムに紐づくスケジュールを更新
     */
    public function update(UpdateScheduleRequest $request, string $id): JsonResponse
    {
        try {
            $updatedSchedule = $this->updateAction->__invoke($request, $id);
        } catch (NonExistingScheduleException $e) {
            return response()->json([
                'message' => '指定されたスケジュールが見つかりません。',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'スケジュールの更新に失敗しました。',
            ], 500);
        }

        // 更新されたスケジュールをレスポンスとして返す
        return response()->json(new ScheduleResource($updatedSchedule), 200);
    }
}
