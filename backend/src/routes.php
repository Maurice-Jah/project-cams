<?php

use Cams\Response;
use Cams\Router;

$router = new Router();

$router->get('/healthz', function () {
    Response::json(['ok' => true]);
});

require __DIR__ . '/routes/auth.php';
require __DIR__ . '/routes/users.php';
require __DIR__ . '/routes/dashboard.php';
require __DIR__ . '/routes/cases.php';
require __DIR__ . '/routes/children.php';
require __DIR__ . '/routes/workers.php';
require __DIR__ . '/routes/reports.php';
require __DIR__ . '/routes/investigations.php';

return $router;
