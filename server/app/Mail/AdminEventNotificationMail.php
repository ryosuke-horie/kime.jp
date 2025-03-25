<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminEventNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $eventTitle;

    public $messageContent;

    public $eventDate;

    public $deadline;

    public $adminName;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($params, $adminName)
    {
        $this->eventTitle = $params['title'];
        $this->messageContent = $params['content'];
        $this->eventDate = $params['event_date'];
        $this->deadline = $params['deadline'];
        $this->adminName = $adminName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('【'.$this->adminName.'からのお知らせ】'.$this->eventTitle)
            ->html(
                $this->adminName.'からのお知らせです。'.
                '<br><br>◆'.$this->eventTitle.
                '<br>'.'イベント日時：'.$this->eventDate.
                '<br>'.'応募締切日時：'.$this->deadline.
                '<br><br>'.$this->messageContent.
                '<br><br>参加・不参加のご回答は<a href="https://user.dojo-pass.com/events">こちら</a>からお願いいたします。'.
                '<br><br>※このメールはシステムからの自動送信です。');
    }
}
