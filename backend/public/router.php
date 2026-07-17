<?php
// Used only with PHP's built-in dev server:
//   php -S localhost:5000 -t public public/router.php
// Routes every request that isn't a real file through index.php.

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false; // let the built-in server serve the static file directly
}

require __DIR__ . '/index.php';
