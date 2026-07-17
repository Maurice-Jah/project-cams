<?php

namespace Cams;

/**
 * Authentication + role authorization.
 *
 * Tokens are a small self-contained "sign what you send" scheme (like a
 * minimal JWT) built from PHP's own hash_hmac — no external library needed:
 *
 *   base64(json payload) + "." + hmac_sha256(payload, APP_SECRET)
 *
 * The payload just carries the user id and an expiry; the *current* role and
 * status are always re-read from the `users` table on every request (see
 * user()), so disabling a user or changing their role takes effect
 * immediately instead of waiting for their token to expire.
 */
class Auth
{
    /** Cached for the lifetime of a single request. */
    private static ?array $user = null;
    private static bool $resolved = false;

    private static function secret(): string
    {
        $secret = getenv('APP_SECRET');
        if ($secret !== false && $secret !== '') {
            return $secret;
        }
        // Fallback so local/dev setups still work without extra config.
        // Set APP_SECRET in .env for any real deployment.
        return 'cams-dev-secret-change-me';
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /** Issue a bearer token for a user row (default: valid for 7 days). */
    public static function issueToken(array $user, int $ttlSeconds = 604800): string
    {
        $payload = [
            'sub' => (int) $user['id'],
            'exp' => time() + $ttlSeconds,
        ];
        $body = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', $body, self::secret(), true)), '+/', '-_'), '=');
        return $body . '.' . $sig;
    }

    private static function decodeToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }
        [$body, $sig] = $parts;

        $expectedSig = rtrim(strtr(base64_encode(hash_hmac('sha256', $body, self::secret(), true)), '+/', '-_'), '=');
        if (!hash_equals($expectedSig, $sig)) {
            return null;
        }

        $json = base64_decode(strtr($body, '-_', '+/'));
        $payload = $json !== false ? json_decode($json, true) : null;
        if (!is_array($payload) || !isset($payload['sub'], $payload['exp'])) {
            return null;
        }
        if ($payload['exp'] < time()) {
            return null;
        }
        return $payload;
    }

    private static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            foreach ((apache_request_headers() ?: []) as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    $header = $value;
                    break;
                }
            }
        }
        if (!preg_match('/^Bearer\s+(\S+)$/i', trim($header), $m)) {
            return null;
        }
        return $m[1];
    }

    /** Resolve the current user (or null) from the request's bearer token. */
    public static function user(): ?array
    {
        if (self::$resolved) {
            return self::$user;
        }
        self::$resolved = true;

        $token = self::bearerToken();
        if ($token === null) {
            return self::$user = null;
        }

        $payload = self::decodeToken($token);
        if ($payload === null) {
            return self::$user = null;
        }

        $row = Model::find('users', (int) $payload['sub']);
        if ($row === null || $row['status'] !== 'active') {
            return self::$user = null;
        }

        return self::$user = $row;
    }

    /** Require a valid, active logged-in user; otherwise respond 401 and stop. */
    public static function requireAuth(): array
    {
        $user = self::user();
        if ($user === null) {
            Response::error('Unauthorized: please log in', 401);
        }
        return $user;
    }

    /** Require the logged-in user to be an administrator; otherwise respond 403 and stop. */
    public static function requireAdmin(): array
    {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            Response::error('Forbidden: administrator access required', 403);
        }
        return $user;
    }

    /** Cached for the lifetime of a single request. */
    private static ?array $worker = null;
    private static bool $workerResolved = false;

    /**
     * Resolve the staff/worker directory record linked to the current login
     * (via workers.user_id), or null if this login isn't linked to one.
     *
     * This is what lets the system reason about a person's *staff role*
     * (social_worker / investigator / supervisor / admin) as distinct from
     * their *login role* (admin / staff). Login role controls system-wide
     * permissions (deleting records, managing accounts); staff role governs
     * case-work permissions like who can close an escalated case or be
     * assigned to run an investigation. See requireCaseClosePermission()
     * and routes/investigations.php.
     */
    public static function currentWorker(): ?array
    {
        if (self::$workerResolved) {
            return self::$worker;
        }
        self::$workerResolved = true;

        $user = self::user();
        if ($user === null) {
            return self::$worker = null;
        }

        $stmt = Database::connection()->prepare('SELECT * FROM "workers" WHERE user_id = :uid');
        $stmt->execute(['uid' => $user['id']]);
        $row = $stmt->fetch();
        return self::$worker = ($row === false ? null : $row);
    }

    /**
     * Enforces that only a supervisor, a staff-directory administrator, or a
     * login-level admin may close a case that is currently escalated.
     * A regular social worker or investigator can still close an ordinary
     * open/under_investigation case on their own — this restriction only
     * kicks in once a case has been escalated, since escalation specifically
     * means "this needs oversight before it's considered resolved."
     * Responds 403 and stops the request if the check fails.
     */
    public static function requireCaseClosePermission(): void
    {
        $user = self::requireAuth();
        if ($user['role'] === 'admin') {
            return; // login-level admin can always close a case
        }
        $worker = self::currentWorker();
        if ($worker !== null && in_array($worker['role'], ['supervisor', 'admin'], true)) {
            return;
        }
        Response::error('Forbidden: only a supervisor or administrator can close an escalated case', 403);
    }

    /** Strip the password hash and camelCase a user row for API responses. */
    public static function sanitize(array $user): array
    {
        unset($user['password_hash']);
        return Utils::rowToApi($user);
    }
}
