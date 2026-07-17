<?php

use Cams\Auth;
use Cams\Database;
use Cams\Mailer;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

// Public: log in with email + password, get back a bearer token + the user.
$router->post('/auth/login', function () {
    $body = Utils::jsonBody();
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');

    if ($email === '' || $password === '') {
        Response::error('Email and password are required', 400);
    }

    $stmt = Database::connection()->prepare('SELECT * FROM "users" WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (
        $user === false ||
        $user['status'] !== 'active' ||
        !Auth::verifyPassword($password, $user['password_hash'])
    ) {
        Response::error('Invalid email or password', 401);
    }

    Response::json([
        'token' => Auth::issueToken($user),
        'user' => Auth::sanitize($user),
    ]);
});

// Requires a valid token: who am I? (used to restore a session on page load)
$router->get('/auth/me', function () {
    $user = Auth::requireAuth();
    Response::json(Auth::sanitize($user));
});

/**
 * Creates a reset token for the given (already-fetched) user row and emails
 * it to them. Shared by the self-service /auth/forgot-password endpoint and
 * the admin-initiated POST /users/:id/send-reset-link endpoint — same
 * mechanism either way, just triggered by a different person.
 */
function issuePasswordReset(array $user): void
{
    $rawToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $rawToken);

    $insert = Database::connection()->prepare(
        'INSERT INTO "password_resets" (user_id, token_hash, expires_at) VALUES (:uid, :hash, :exp)'
    );
    $insert->execute([
        'uid' => $user['id'],
        'hash' => $tokenHash,
        'exp' => (new \DateTime('+30 minutes'))->format('Y-m-d H:i:s.uP'),
    ]);

    $frontendUrl = rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:5173', '/');
    $resetLink = "{$frontendUrl}/reset-password?token={$rawToken}";

    Mailer::send(
        $user['email'],
        'Reset your CAMS password',
        "Hi {$user['name']},\n\n"
        . "Someone (hopefully you) requested a password reset for your CAMS account.\n\n"
        . "Reset it here (this link expires in 30 minutes and can only be used once):\n{$resetLink}\n\n"
        . "If you didn't request this, you can safely ignore this email — your password won't change.\n"
    );
}

/**
 * Issues a reset token for the given email and emails a reset link.
 * Always responds with the same generic message whether or not the email
 * exists — this is a deliberate anti-enumeration measure so an attacker
 * can't use this endpoint to discover which emails have accounts.
 */
$router->post('/auth/forgot-password', function () {
    $body = Utils::jsonBody();
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $generic = ['message' => 'If an account exists for that email, a password reset link has been sent.'];

    if ($email === '') {
        Response::error('Email is required', 400);
    }

    $stmt = Database::connection()->prepare('SELECT * FROM "users" WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // Deliberately identical response whether or not the account exists —
    // see docblock above.
    if ($user !== false && $user['status'] === 'active') {
        issuePasswordReset($user);
    }

    Response::json($generic);
});

/**
 * Completes a reset started by /auth/forgot-password: validates the raw
 * token against its stored hash, checks it hasn't expired or been used
 * already, then sets the new password and marks the token used (so it
 * can't be replayed).
 */
$router->post('/auth/reset-password', function () {
    $body = Utils::jsonBody();
    $token = (string) ($body['token'] ?? '');
    $password = (string) ($body['password'] ?? '');

    if ($token === '' || $password === '') {
        Response::error('Token and new password are required', 400);
    }
    if (strlen($password) < 8) {
        Response::error('Password must be at least 8 characters', 400);
    }

    $tokenHash = hash('sha256', $token);
    $stmt = Database::connection()->prepare(
        'SELECT * FROM "password_resets" WHERE token_hash = :hash'
    );
    $stmt->execute(['hash' => $tokenHash]);
    $reset = $stmt->fetch();

    if (
        $reset === false ||
        $reset['used_at'] !== null ||
        strtotime($reset['expires_at']) < time()
    ) {
        Response::error('This reset link is invalid or has expired. Please request a new one.', 400);
    }

    $conn = Database::connection();
    $conn->prepare('UPDATE "users" SET password_hash = :hash, updated_at = now() WHERE id = :id')
        ->execute(['hash' => Auth::hashPassword($password), 'id' => $reset['user_id']]);

    // Mark this token used, and invalidate any other outstanding reset
    // tokens for the same user (e.g. if they requested the email twice).
    $conn->prepare('UPDATE "password_resets" SET used_at = now() WHERE user_id = :uid AND used_at IS NULL')
        ->execute(['uid' => $reset['user_id']]);

    Response::json(['message' => 'Your password has been reset. You can now log in.']);
});

/** Self-service password change for a logged-in user (must know their current password). */
$router->post('/auth/change-password', function () {
    $user = Auth::requireAuth();
    $body = Utils::jsonBody();
    $current = (string) ($body['currentPassword'] ?? '');
    $next = (string) ($body['newPassword'] ?? '');

    if (!Auth::verifyPassword($current, $user['password_hash'])) {
        Response::error('Current password is incorrect', 400);
    }
    if (strlen($next) < 8) {
        Response::error('New password must be at least 8 characters', 400);
    }

    Database::connection()
        ->prepare('UPDATE "users" SET password_hash = :hash, updated_at = now() WHERE id = :id')
        ->execute(['hash' => Auth::hashPassword($next), 'id' => $user['id']]);

    Response::json(['message' => 'Password updated.']);
});
