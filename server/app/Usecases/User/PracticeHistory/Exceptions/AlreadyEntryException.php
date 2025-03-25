<?php

namespace App\Usecases\User\PracticeHistory\Exceptions;

use Exception;

class AlreadyEntryException extends Exception
{
    protected $message = '本日のこのクラスには既に登録されています';
}
