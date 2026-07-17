<?php

namespace Cams;

class Response
{
    /** Send a JSON body with the given HTTP status code, then stop the script. */
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** Send an empty body with the given status (equivalent to res.sendStatus(204)). */
    public static function status(int $status): void
    {
        http_response_code($status);
        exit;
    }

    public static function error(string $message, int $status = 500): void
    {
        self::json(['error' => $message], $status);
    }
}
