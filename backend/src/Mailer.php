<?php

namespace Cams;

/**
 * A deliberately small mail helper — this project doesn't need a full mail
 * library (PHPMailer/Symfony Mailer) for what it does: sending short
 * transactional password-reset emails.
 *
 * Two modes, controlled by MAIL_ENABLED in .env:
 *  - true:  attempts to send via PHP's built-in mail() function. This only
 *           works if the server has a configured MTA (sendmail/Postfix/an
 *           SMTP relay wired to sendmail) — fine for a real deployment,
 *           usually NOT present on a local dev machine.
 *  - false (default): writes the email to backend/storage/outbox/ as a
 *           plain text file instead of actually sending it. This mirrors
 *           how mainstream frameworks handle local development (e.g.
 *           Laravel's "log" mail driver) — it lets the whole reset flow be
 *           exercised and demoed end-to-end without needing a real mail
 *           server, while keeping the exact same code path for production
 *           (just flip MAIL_ENABLED and set up an MTA).
 */
class Mailer
{
    public static function send(string $to, string $subject, string $body): void
    {
        $enabled = strtolower((string) getenv('MAIL_ENABLED')) === 'true';

        if ($enabled) {
            $from = getenv('MAIL_FROM') ?: 'no-reply@cams.local';
            $headers = "From: {$from}\r\nContent-Type: text/plain; charset=UTF-8";
            // mail() returns false on failure (e.g. no MTA configured) —
            // fall through to the file log either way so nothing is lost.
            if (@mail($to, $subject, $body, $headers)) {
                return;
            }
        }

        self::logToFile($to, $subject, $body);
    }

    private static function logToFile(string $to, string $subject, string $body): void
    {
        $dir = __DIR__ . '/../storage/outbox';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $filename = sprintf('%s_%s.txt', date('Y-m-d_H-i-s'), bin2hex(random_bytes(3)));
        $contents = "To: {$to}\nSubject: {$subject}\nDate: " . date('c') . "\n\n{$body}\n";
        file_put_contents($dir . '/' . $filename, $contents);
    }
}
