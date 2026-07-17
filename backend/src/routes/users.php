<?php

use Cams\Auth;
use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

// Login-account management (who can sign in, and with what role). Every
// route here is administrator-only — this is exactly the permission the
// admin role exists for.

const USERS_TABLE = 'users';
const USERS_COLUMNS = ['name', 'email', 'role', 'status'];

$router->get('/users', function () {
    Auth::requireAdmin();
    $rows = Model::all(USERS_TABLE, 'name');
    Response::json(array_map([Auth::class, 'sanitize'], $rows));
});

$router->post('/users', function () {
    Auth::requireAdmin();
    try {
        $body = Utils::jsonBody();
        $columns = Utils::bodyToColumns($body, USERS_COLUMNS);
        $password = (string) ($body['password'] ?? '');

        if (empty($columns['name']) || empty($columns['email']) || $password === '') {
            Response::error('Name, email and password are required', 400);
        }
        if (strlen($password) < 8) {
            Response::error('Password must be at least 8 characters', 400);
        }

        $columns['email'] = strtolower(trim($columns['email']));
        $columns['password_hash'] = Auth::hashPassword($password);
        if (empty($columns['role'])) {
            $columns['role'] = 'staff';
        }

        $row = Model::insert(USERS_TABLE, $columns);
        Response::json(Auth::sanitize($row), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->patch('/users/:id', function (array $params) {
    Auth::requireAdmin();
    try {
        $body = Utils::jsonBody();
        $columns = Utils::bodyToColumns($body, USERS_COLUMNS);

        if (!empty($body['password'])) {
            if (strlen((string) $body['password']) < 8) {
                Response::error('Password must be at least 8 characters', 400);
            }
            $columns['password_hash'] = Auth::hashPassword((string) $body['password']);
        }
        if (isset($columns['email'])) {
            $columns['email'] = strtolower(trim($columns['email']));
        }

        $row = Model::update(USERS_TABLE, (int) $params['id'], $columns);
        if ($row === null) {
            Response::error('User not found', 404);
        }
        Response::json(Auth::sanitize($row));
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->delete('/users/:id', function (array $params) {
    $admin = Auth::requireAdmin();
    if ((int) $params['id'] === (int) $admin['id']) {
        Response::error('You cannot delete your own account', 400);
    }
    $row = Model::delete(USERS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('User not found', 404);
    }
    Response::status(204);
});

/**
 * Admin-assisted password reset: an admin can trigger a reset email for
 * someone who's locked out, without ever needing to know or set their
 * password directly. Reuses the exact same token mechanism as the
 * self-service "Forgot password?" flow (see routes/auth.php).
 */
$router->post('/users/:id/send-reset-link', function (array $params) {
    Auth::requireAdmin();
    $row = Model::find(USERS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('User not found', 404);
    }
    issuePasswordReset($row);
    Response::json(['message' => 'A password reset link has been sent to ' . $row['email'] . '.']);
});
