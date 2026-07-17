<?php
use Cams\Auth;
use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

const WORKERS_TABLE = 'workers';
const WORKERS_COLUMNS = [
    'first_name', 'last_name', 'email', 'phone', 'role', 'department', 'status', 'user_id',
];

$router->get('/workers', function () {
    Response::json(Utils::rowsToApi(Model::all(WORKERS_TABLE)));
});

// Who am I on the staff directory? Resolves the logged-in user's linked
// worker record (if any), so the frontend can show "my assigned cases".
// Static route — must come before "/workers/:id" (first match wins).
$router->get('/workers/me', function () {
    $user = Auth::requireAuth();
    $stmt = \Cams\Database::connection()->prepare('SELECT * FROM "workers" WHERE user_id = :uid');
    $stmt->execute(['uid' => $user['id']]);
    $row = $stmt->fetch();
    Response::json($row === false ? null : Utils::rowToApi($row));
});

$router->post('/workers', function () {
    try {
        $columns = Utils::bodyToColumns(Utils::jsonBody(), WORKERS_COLUMNS);
        $row = Model::insert(WORKERS_TABLE, $columns);
        Response::json(Utils::rowToApi($row), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->get('/workers/:id', function (array $params) {
    $row = Model::find(WORKERS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Worker not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->patch('/workers/:id', function (array $params) {
    $columns = Utils::bodyToColumns(Utils::jsonBody(), WORKERS_COLUMNS);
    $row = Model::update(WORKERS_TABLE, (int) $params['id'], $columns);
    if ($row === null) {
        Response::error('Worker not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->delete('/workers/:id', function (array $params) {
    Auth::requireAdmin();
    $row = Model::delete(WORKERS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Worker not found', 404);
    }
    Response::status(204);
});


