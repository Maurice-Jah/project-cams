<?php

namespace Cams;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Sends transactional emails (currently just password resets) via SMTP.
 *
 * Modes, controlled by MAIL_ENABLED in .env / environment variables:
 *  - true:  sends via real SMTP using PHPMailer, configured through
 *           SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, MAIL_FROM.
 *  - false (default), or if SMTP sending throws: falls back to writing the
 *           email to backend/storage/outbox/ as a plain text file, so the
 *           flow can still be exercised locally without any mail setup.
 */
class Mailer
{
    public static function send(string $to, string $subject, string $body): void
    {
        $enabled = strtolower((string) getenv('MAIL_ENABLED')) === 'true';

        if ($enabled) {
            try {
                self::sendSmtp($to, $subject, $body);
                return;
            } catch (\Throwable $e) {
                // Fall through to the file log so nothing is silently lost —
                // but still surface the real reason in the server logs.
                error_log('Mailer: SMTP send failed, falling back to file log: ' . $e->getMessage());
            }
        }

        self::logToFile($to, $subject, $body);
    }

    private static function sendSmtp(string $to, string $subject, string $body): void
    {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: '';
        $mail->Password   = getenv('SMTP_PASS') ?: '';
        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int) (getenv('SMTP_PORT') ?: 587);

        $from = getenv('MAIL_FROM') ?: $mail->Username;
        $mail->setFrom($from, 'CAMS');
        $mail->addAddress($to);

        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->isHTML(false);

        $mail->send();
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