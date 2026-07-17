<?php

namespace Cams;

class Utils
{
    /** Columns that hold a timezone-aware timestamp and should be serialized as ISO-8601 (like Drizzle's `timestamp` -> Date -> toISOString()). */
    private const TIMESTAMP_KEYS = ['created_at', 'updated_at', 'reported_at', 'closed_at', 'referred_at'];

    public static function snakeToCamel(string $key): string
    {
        return preg_replace_callback('/_([a-z0-9])/', fn($m) => strtoupper($m[1]), $key);
    }

    public static function camelToSnake(string $key): string
    {
        return strtolower(preg_replace('/([a-z0-9])([A-Z])/', '$1_$2', $key));
    }

    /** Convert a DB row (snake_case keys) to a JSON-ready array (camelCase keys, ISO timestamps). */
    public static function rowToApi(array $row): array
    {
        $out = [];
        foreach ($row as $key => $value) {
            if ($value !== null && in_array($key, self::TIMESTAMP_KEYS, true)) {
                $value = self::toIso8601($value);
            }
            $out[self::snakeToCamel($key)] = $value;
        }
        return $out;
    }

    /** Convert a list of DB rows to JSON-ready arrays. */
    public static function rowsToApi(array $rows): array
    {
        return array_map([self::class, 'rowToApi'], $rows);
    }

    /** Convert a request body (camelCase keys) into snake_case, keeping only allowed columns. */
    public static function bodyToColumns(array $body, array $allowedColumns): array
    {
        $out = [];
        foreach ($body as $key => $value) {
            $snake = self::camelToSnake($key);
            if (in_array($snake, $allowedColumns, true)) {
                $out[$snake] = $value;
            }
        }
        return $out;
    }

    private static function toIso8601(string $value): string
    {
        $dt = new \DateTime($value);
        return $dt->format('Y-m-d\TH:i:s.v\Z');
    }

    /** Parse the JSON request body into an associative array (equivalent to express.json()). */
    public static function jsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
