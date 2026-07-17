<?php

use Cams\Auth;
use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

$router->get('/dashboard/summary', function () {
    try {
        $cases = Model::all('cases');
        $children = Model::all('children');
        $workers = Model::all('workers');
        $reports = Model::all('reports');
        $investigations = Model::all('investigations');

        // If the logged-in user has a linked staff/worker record (see
        // GET /workers/me), surface their own assigned cases so staff land
        // on the dashboard and immediately see what's theirs.
        $myWorker = null;
        $user = Auth::user();
        if ($user !== null) {
            foreach ($workers as $w) {
                if ((int) ($w['user_id'] ?? 0) === (int) $user['id']) {
                    $myWorker = $w;
                    break;
                }
            }
        }
        $myCases = $myWorker === null
            ? []
            : array_values(array_filter($cases, fn($c) => (int) $c['worker_id'] === (int) $myWorker['id']));
        usort($myCases, fn($a, $b) => strtotime($b['created_at']) <=> strtotime($a['created_at']));

        $recentCases = $cases;
        usort($recentCases, fn($a, $b) => strtotime($b['created_at']) <=> strtotime($a['created_at']));
        $recentCases = array_slice($recentCases, 0, 5);

        $typeMap = [];
        $statusMap = [];
        foreach ($cases as $c) {
            $typeMap[$c['abuse_type']] = ($typeMap[$c['abuse_type']] ?? 0) + 1;
            $statusMap[$c['status']] = ($statusMap[$c['status']] ?? 0) + 1;
        }

        Response::json([
            'totalCases' => count($cases),
            'openCases' => count(array_filter($cases, fn($c) => $c['status'] === 'open')),
            'closedCases' => count(array_filter($cases, fn($c) => $c['status'] === 'closed')),
            'criticalCases' => count(array_filter($cases, fn($c) => $c['priority'] === 'critical')),
            'totalChildren' => count($children),
            'totalWorkers' => count(array_filter($workers, fn($w) => $w['status'] === 'active')),
            'totalReports' => count($reports),
            'newReports' => count(array_filter($reports, fn($r) => $r['status'] === 'new')),
            'activeInvestigations' => count(array_filter(
                $investigations,
                fn($i) => $i['status'] === 'open' || $i['status'] === 'in_progress'
            )),
            'recentCases' => Utils::rowsToApi($recentCases),
            'myWorkerId' => $myWorker === null ? null : (int) $myWorker['id'],
            'myOpenCaseCount' => count(array_filter($myCases, fn($c) => $c['status'] !== 'closed')),
            'myAssignedCases' => Utils::rowsToApi(array_slice($myCases, 0, 5)),
            'casesByType' => array_map(
                fn($label, $count) => ['label' => $label, 'count' => $count],
                array_keys($typeMap),
                array_values($typeMap)
            ),
            'casesByStatus' => array_map(
                fn($label, $count) => ['label' => $label, 'count' => $count],
                array_keys($statusMap),
                array_values($statusMap)
            ),
        ]);
    } catch (\Throwable $e) {
        Response::error((string) $e, 500);
    }
});
