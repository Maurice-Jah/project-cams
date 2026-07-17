<?php

require __DIR__ . '/../src/Env.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Response.php';
require __DIR__ . '/../src/Router.php';
require __DIR__ . '/../src/Utils.php';
require __DIR__ . '/../src/Model.php';
require __DIR__ . '/../src/Auth.php';
require __DIR__ . '/../src/Mailer.php';

use Cams\Auth;
use Cams\Env;
use Cams\Response;

Env::load(__DIR__ . '/../.env');

// --- CORS (equivalent to app.use(cors())) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Routes that don't require a logged-in user. Everything else under /api
// needs a valid bearer token (see Auth::requireAuth()); some routes (e.g.
// deleting a case, or any /users management) additionally require the
// 'admin' role via Auth::requireAdmin() inside the route handler itself.
//
// forgot-password/reset-password must be public: by definition, someone
// using them doesn't have a working login yet.
const PUBLIC_API_PATHS = ['/api/healthz', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'];

try {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
    if (!in_array($path, PUBLIC_API_PATHS, true)) {
        Auth::requireAuth();
    }

    /** @var \Cams\Router $router */
    $router = require __DIR__ . '/../src/routes.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'], '/api');
} catch (\Throwable $e) {
    Response::error('Internal server error: ' . $e->getMessage(), 500);
}
