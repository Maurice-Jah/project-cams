<?php

use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

const INVESTIGATIONS_TABLE = 'investigations';
const INVESTIGATIONS_COLUMNS = [
    'case_id', 'worker_id', 'status', 'started_at', 'completed_at', 'findings', 'outcome',
];

/**
 * Investigations are formal, so only a worker whose staff-directory role is
 * "investigator" may be assigned to run one — this is what makes that role
 * label mean something rather than just being descriptive text. Responds
 * 422 and stops the request if the chosen worker isn't an investigator.
 * A null/absent worker_id (unassigned) is always fine.
 */
function assertAssignableInvestigator(array $columns): void
{
    if (!array_key_exists('worker_id', $columns) || $columns['worker_id'] === null) {
        return;
    }
    $worker = Model::find('workers', (int) $columns['worker_id']);
    if ($worker === null || $worker['role'] !== 'investigator') {
        Response::error(
            'Only a worker whose staff role is "investigator" can be assigned to an investigation.',
            422
        );
    }
}

$router->get('/investigations', function () {
    Response::json(Utils::rowsToApi(Model::all(INVESTIGATIONS_TABLE)));
});

$router->post('/investigations', function () {
    try {
        $columns = Utils::bodyToColumns(Utils::jsonBody(), INVESTIGATIONS_COLUMNS);
        assertAssignableInvestigator($columns);
        $row = Model::insert(INVESTIGATIONS_TABLE, $columns);
        Response::json(Utils::rowToApi($row), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->get('/investigations/:id', function (array $params) {
    $row = Model::find(INVESTIGATIONS_TABLE, (int) $params['id']);
    if ($row === null) {
        Response::error('Investigation not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});

$router->patch('/investigations/:id', function (array $params) {
    $columns = Utils::bodyToColumns(Utils::jsonBody(), INVESTIGATIONS_COLUMNS);
    assertAssignableInvestigator($columns);
    $row = Model::update(INVESTIGATIONS_TABLE, (int) $params['id'], $columns);
    if ($row === null) {
        Response::error('Investigation not found', 404);
    }
    Response::json(Utils::rowToApi($row));
});
