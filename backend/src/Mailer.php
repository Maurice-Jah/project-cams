<?php

namespace Cams;

/**
 * Sends transactional emails (currently just password resets) via the
 * Resend HTTPS API (https://resend.com) rather than raw SMTP.
 *
 * Why HTTPS and not SMTP: many free hosting tiers (including Render's free
 * web services) block outbound traffic on SMTP ports 25/465/587 entirely to
 * prevent spam abuse. A plain HTTPS POST request on port 443 is never
 * blocked, since it's indistinguishable from any other API call the app
 * already makes.
 *
 * Modes, controlled by MAIL_ENABLED in .env / environment variables:
 *  - true:  sends via Resend's API, using RESEND_API_KEY and MAIL_FROM.
 *  - false (default), or if the API call fails: falls back to writing the
 *           email to backend/storage/outbox/ as a plain text file, so the
 *           flow can still be exercised locally without any setup.
 */
class Mailer
{
    public static function send(string $to, string $subject, string $body): void
    {
        $enabled = strtolower((string) getenv('MAIL_ENABLED')) === 'true';

        if ($enabled) {
            try {
                self::sendViaResend($to, $subject, $body);
                return;
            } catch (\Throwable $e) {
                error_log('Mailer: Resend send failed, falling back to file log: ' . $e->getMessage());
            }
        }

        self::logToFile($to, $subject, $body);
    }

    private static function sendViaResend(string $to, string $subject, string $body): void
    {
        $apiKey = getenv('RESEND_API_KEY') ?: '';
        if ($apiKey === '') {
            throw new \RuntimeException('RESEND_API_KEY is not set');
        }
        $from = getenv('MAIL_FROM') ?: 'CAMS <onboarding@resend.dev>';

        $payload = json_encode([
            'from'    => $from,
            'to'      => [$to],
            'subject' => $subject,
            'text'    => $body,
        ]);

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT        => 10, // never let one email hang the whole server
        ]);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \RuntimeException('Resend request failed: ' . $error);
        }
        if ($status < 200 || $status >= 300) {
            throw new \RuntimeException("Resend API returned HTTP {$status}: {$response}");
        }
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