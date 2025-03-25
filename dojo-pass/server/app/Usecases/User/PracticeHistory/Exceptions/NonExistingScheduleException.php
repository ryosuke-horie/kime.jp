<?php

namespace App\Usecases\User\PracticeHistory\Exceptions;

use Exception;

class NonExistingScheduleException extends Exception
{
    protected $message = '指定されたスケジュールが見つかりません。';
}
