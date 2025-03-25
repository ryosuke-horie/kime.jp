<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $messageContent;

    public $adminName;

    /**
     * Create a new message instance.
     *
     * @param  string  $messageContent  本文
     * @param  string  $adminName  ジム名
     * @return void
     */
    public function __construct(string $messageContent, string $adminName)
    {
        $this->messageContent = $messageContent;
        $this->adminName = $adminName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('【'.$this->adminName.'からのお知らせ】')
            ->html($this->messageContent);
    }
}
