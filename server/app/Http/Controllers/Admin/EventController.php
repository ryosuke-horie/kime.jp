<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Usecases\Admin\Event\DeleteAction;
use App\Usecases\Admin\Event\IndexAction;
use App\Usecases\Admin\Event\ShowAction;
use App\Usecases\Admin\Event\StoreAction;
use App\Usecases\Admin\Event\UpdateAction;

class EventController extends Controller
{
    protected IndexAction $indexAction;

    protected StoreAction $storeAction;

    protected ShowAction $showAction;

    protected UpdateAction $updateAction;

    protected DeleteAction $deleteAction;

    public function __construct(
        IndexAction $indexAction,
        StoreAction $storeAction,
        ShowAction $showAction,
        UpdateAction $updateAction,
        DeleteAction $deleteAction
    ) {
        $this->indexAction = $indexAction;
        $this->storeAction = $storeAction;
        $this->showAction = $showAction;
        $this->updateAction = $updateAction;
        $this->deleteAction = $deleteAction;
    }

    /**
     * イベント一覧機能
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // イベント一覧を取得
        $events = $this->indexAction->__invoke();

        return response()->json($events);
    }

    /**
     * イベント登録機能
     */
    public function store(StoreEventRequest $request)
    {
        // リクエストパラメータを取得
        $params = $request->validated();

        // イベント登録
        $this->storeAction->__invoke($params);

        return response()->json(['message' => 'イベントを登録しました。']);
    }

    /**
     * イベント詳細機能
     */
    public function show($id)
    {
        // イベント詳細を取得
        $event = $this->showAction->__invoke($id);

        return response()->json($event);
    }

    /**
     * イベント更新機能
     */
    public function update(UpdateEventRequest $request, $id)
    {
        // イベント更新
        $this->updateAction->__invoke($request, $id);

        return response()->json(['message' => 'イベントを更新しました。']);
    }

    /**
     * イベント削除機能
     */
    public function destroy($id)
    {
        // イベント削除
        $this->deleteAction->__invoke($id);

        return response()->json(['message' => 'イベントを削除しました。']);
    }
}
