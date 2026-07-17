<?php

use Cams\Auth;
use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

const CHILDREN_TABLE = 'children';
const CHILDREN_COLUMNS = [
    'first_name', 'last_name', 'date_of_birth', 'gender', 'status',
    'address', 'guardian_name', 'guardian_phone', 'school_name', 'notes',
];

$router->get('/children', function () {
    Response::json(Utils::rowsToApi(Model::all(CHILDREN_TABLE)));
});

$router->post('/children', function () {
    try {
        $columns = Utils::bodyToColumns(Utils::jsonBody(), CHILDREN_COLUMNS);
        $row = Model::insert(CHILDREN_TABLE, $columns);
        Response::json(Utils::rowToApi($row), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->get('/children/:id', function (array $params) {
    $row = Model::find(CHILDREN_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Child not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->patch('/children/:id', function (array $params) {
    $columns = Utils::bodyToColumns(Utils::jsonBody(), CHILDREN_COLUMNS);
    $row = Model::update(CHILDREN_TABLE, (int) $params['id'], $columns);
    if ($row === null) {
        Response::error('Child not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->delete('/children/:id', function (array $params) {
    Auth::requireAdmin();
    $row = Model::delete(CHILDREN_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Child not found', 404);
    }
    Response::status(204);
});
