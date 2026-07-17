<?php

namespace Cams;

use PDO;

class Model
{
    public static function all(string $table, string $orderBy = 'created_at'): array
    {
        $stmt = Database::connection()->query(
            "SELECT * FROM \"{$table}\" ORDER BY \"{$orderBy}\" ASC"
        );
        return $stmt->fetchAll();
    }

    public static function find(string $table, int $id): ?array
    {
        $stmt = Database::connection()->prepare("SELECT * FROM \"{$table}\" WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function count(string $table): int
    {
        $stmt = Database::connection()->query("SELECT COUNT(*) AS c FROM \"{$table}\"");
        return (int) $stmt->fetch()['c'];
    }

    /** Insert a row and return the freshly inserted record. */
    public static function insert(string $table, array $columns): array
    {
        if (empty($columns)) {
            throw new \InvalidArgumentException('No columns to insert');
        }

        $keys = array_keys($columns);
        $placeholders = array_map(fn($k) => ":{$k}", $keys);

        $sql = sprintf(
            'INSERT INTO "%s" (%s) VALUES (%s) RETURNING *',
            $table,
            implode(', ', array_map(fn($k) => "\"{$k}\"", $keys)),
            implode(', ', $placeholders)
        );

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($columns);
        return $stmt->fetch();
    }

    /** Update a row by id and return the updated record, or null if it doesn't exist. */
    public static function update(string $table, int $id, array $columns): ?array
    {
        if (empty($columns)) {
            // Nothing to change — just return the current row.
            return self::find($table, $id);
        }

        // Always bump updated_at if the table has that column.
        if (self::hasColumn($table, 'updated_at')) {
            $columns['updated_at'] = (new \DateTime())->format('Y-m-d H:i:s.uP');
        }

        $sets = implode(', ', array_map(fn($k) => "\"{$k}\" = :{$k}", array_keys($columns)));
        $sql = "UPDATE \"{$table}\" SET {$sets} WHERE id = :id RETURNING *";

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute([...$columns, 'id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function delete(string $table, int $id): ?array
    {
        $stmt = Database::connection()->prepare("DELETE FROM \"{$table}\" WHERE id = :id RETURNING *");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function deleteWhere(string $table, string $column, int $value): void
    {
        $stmt = Database::connection()->prepare("DELETE FROM \"{$table}\" WHERE \"{$column}\" = :v");
        $stmt->execute(['v' => $value]);
    }

    private static function hasColumn(string $table, string $column): bool
    {
        static $cache = [];
        $key = "{$table}.{$column}";
        if (isset($cache[$key])) {
            return $cache[$key];
        }
        $stmt = Database::connection()->prepare(
            'SELECT 1 FROM information_schema.columns WHERE table_name = :t AND column_name = :c'
        );
        $stmt->execute(['t' => $table, 'c' => $column]);
        return $cache[$key] = (bool) $stmt->fetch();
    }
}
