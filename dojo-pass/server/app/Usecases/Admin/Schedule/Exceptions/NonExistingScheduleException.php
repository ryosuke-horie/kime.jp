<?php

namespace App\Usecases\Admin\Schedule\Exceptions;

use Exception;

class NonExistingScheduleException extends Exception
{
    protected $message = '指定されたスケジュールが見つかりません。';
}
