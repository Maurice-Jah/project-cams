<?php

use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

const REPORTS_TABLE = 'reports';
const REPORTS_COLUMNS = [
    'reporter_name', 'reporter_type', 'reporter_phone', 'reporter_email',
    'abuse_type', 'description', 'child_first_name', 'child_last_name',
    'child_age', 'incident_location', 'incident_date', 'status', 'reported_at',
];

$router->get('/reports', function () {
    Response::json(Utils::rowsToApi(Model::all(REPORTS_TABLE)));
});

$router->post('/reports', function () {
    try {
        $columns = Utils::bodyToColumns(Utils::jsonBody(), REPORTS_COLUMNS);
        $row = Model::insert(REPORTS_TABLE, $columns);
        Response::json(Utils::rowToApi($row), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->get('/reports/:id', function (array $params) {
    $row = Model::find(REPORTS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Report not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->patch('/reports/:id', function (array $params) {
    $columns = Utils::bodyToColumns(Utils::jsonBody(), REPORTS_COLUMNS);
    $row = Model::update(REPORTS_TABLE, (int) $params['id'], $columns);
    if ($row === null) {
        Response::error('Report not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});
