<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Usecases\User\Event\IndexAction;

class EventController extends Controller
{
    protected IndexAction $indexAction;

    public function __construct(IndexAction $indexAction)
    {
        $this->indexAction = $indexAction;
    }

    /**
     * 所属ジムのイベント一覧を取得
     */
    public function index()
    {
        $events = $this->indexAction->__invoke();

        return response()->json($events);
    }
}
