<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactMembers\ContactMembersRequest;
use App\Usecases\Admin\ContactMembers\ContactMembersAction;

class ContactMembersController extends Controller
{
    private ContactMembersAction $contactMembersAction;

    public function __construct(ContactMembersAction $contactMembersAction)
    {
        $this->contactMembersAction = $contactMembersAction;
    }

    public function contactMembers(ContactMembersRequest $request)
    {
        try {
            return $this->contactMembersAction->__invoke($request);
        } catch (\Exception $e) {
            return response()->json(['message' => 'メール送信に失敗しました。'], 500);
        }
    }
}
