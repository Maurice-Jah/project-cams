<?php

use Cams\Auth;
use Cams\Database;
use Cams\Model;
use Cams\Response;
use Cams\Router;
use Cams\Utils;

/** @var Router $router */

const CASES_TABLE = 'cases';
const CASE_NOTES_TABLE = 'case_notes';
const CASES_COLUMNS = [
    'case_number', 'status', 'priority', 'abuse_type', 'description',
    'reported_at', 'closed_at', 'child_id', 'worker_id', 'report_id',
    'referred_to_law_enforcement', 'referral_agency', 'referral_contact', 'referral_reference_number', 'referred_at',
];
const CASE_NOTES_COLUMNS = ['case_id', 'content', 'author_name'];

/**
 * Selects a case joined with its child and worker, shaped like the
 * original getWithRel() helper (child/worker omitted when absent).
 */
function fetchCaseWithRelations(int $id): ?array
{
    $sql = <<<SQL
        SELECT
            c.*,
            ch.id AS child_id_r, ch.first_name AS child_first_name_r, ch.last_name AS child_last_name_r,
            ch.date_of_birth AS child_date_of_birth_r, ch.gender AS child_gender_r, ch.status AS child_status_r,
            ch.address AS child_address_r, ch.guardian_name AS child_guardian_name_r,
            ch.guardian_phone AS child_guardian_phone_r, ch.school_name AS child_school_name_r,
            ch.notes AS child_notes_r, ch.created_at AS child_created_at_r, ch.updated_at AS child_updated_at_r,
            w.id AS worker_id_r, w.first_name AS worker_first_name_r, w.last_name AS worker_last_name_r,
            w.email AS worker_email_r, w.phone AS worker_phone_r, w.role AS worker_role_r,
            w.department AS worker_department_r, w.status AS worker_status_r,
            w.created_at AS worker_created_at_r, w.updated_at AS worker_updated_at_r
        FROM cases c
        LEFT JOIN children ch ON c.child_id = ch.id
        LEFT JOIN workers w ON c.worker_id = w.id
        WHERE c.id = :id
    SQL;

    $stmt = Database::connection()->prepare($sql);
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if ($row === false) {
        return null;
    }
    return shapeCaseRow($row);
}

/** Reshapes a flat joined row into { ...case, child?, worker? }. */
function shapeCaseRow(array $row): array
{
    $caseColumns = array_merge(['id'], CASES_COLUMNS, ['created_at', 'updated_at']);
    $case = [];
    foreach ($caseColumns as $col) {
        $case[$col] = $row[$col];
    }
    $out = Utils::rowToApi($case);

    if ($row['child_id_r'] !== null) {
        $out['child'] = Utils::rowToApi([
            'id' => $row['child_id_r'],
            'first_name' => $row['child_first_name_r'],
            'last_name' => $row['child_last_name_r'],
            'date_of_birth' => $row['child_date_of_birth_r'],
            'gender' => $row['child_gender_r'],
            'status' => $row['child_status_r'],
            'address' => $row['child_address_r'],
            'guardian_name' => $row['child_guardian_name_r'],
            'guardian_phone' => $row['child_guardian_phone_r'],
            'school_name' => $row['child_school_name_r'],
            'notes' => $row['child_notes_r'],
            'created_at' => $row['child_created_at_r'],
            'updated_at' => $row['child_updated_at_r'],
        ]);
    }

    if ($row['worker_id_r'] !== null) {
        $out['worker'] = Utils::rowToApi([
            'id' => $row['worker_id_r'],
            'first_name' => $row['worker_first_name_r'],
            'last_name' => $row['worker_last_name_r'],
            'email' => $row['worker_email_r'],
            'phone' => $row['worker_phone_r'],
            'role' => $row['worker_role_r'],
            'department' => $row['worker_department_r'],
            'status' => $row['worker_status_r'],
            'created_at' => $row['worker_created_at_r'],
            'updated_at' => $row['worker_updated_at_r'],
        ]);
    }

    return $out;
}

/**
 * Normalizes case-column input shared by POST and PATCH:
 * - Casts referred_to_law_enforcement to 0/1 (PDO would otherwise send PHP's
 *   `false` as an empty string, which Postgres' boolean parser rejects).
 * - Auto-stamps/clears referred_at the same way closed_at is auto-managed:
 *   turning the referral on stamps "now" unless the caller supplied a time;
 *   turning it off clears the stamp since it's no longer accurate.
 */
function normalizeCaseColumns(array $columns): array
{
    if (array_key_exists('referred_to_law_enforcement', $columns)) {
        $flag = $columns['referred_to_law_enforcement'] ? 1 : 0;
        $columns['referred_to_law_enforcement'] = $flag;
        if ($flag === 1 && empty($columns['referred_at'])) {
            $columns['referred_at'] = date('c');
        } elseif ($flag === 0 && !array_key_exists('referred_at', $columns)) {
            $columns['referred_at'] = null;
        }
    }
    return $columns;
}

// Order matters: static routes before dynamic ":id" routes (first match wins).

$router->get('/cases/stats', function () {
    $rows = Model::all(CASES_TABLE);
    Response::json([
        'total' => count($rows),
        'open' => count(array_filter($rows, fn($r) => $r['status'] === 'open')),
        'closed' => count(array_filter($rows, fn($r) => $r['status'] === 'closed')),
        'critical' => count(array_filter($rows, fn($r) => $r['priority'] === 'critical')),
    ]);
});

$router->get('/cases', function () {
    try {
        // ?assignedToMe=1 narrows the list to cases whose worker_id matches
        // the logged-in user's linked staff/worker record (see
        // GET /workers/me). Used by the "My Cases" view on the Cases page
        // and the "My Assigned Cases" panel on the dashboard.
        $onlyMine = isset($_GET['assignedToMe']) && $_GET['assignedToMe'] === '1';
        $params = [];
        $where = '';
        if ($onlyMine) {
            $user = Auth::requireAuth();
            $stmt = Database::connection()->prepare('SELECT id FROM "workers" WHERE user_id = :uid');
            $stmt->execute(['uid' => $user['id']]);
            $worker = $stmt->fetch();
            // No linked worker record => nobody's assigned cases to show.
            $where = 'WHERE c.worker_id = :worker_id';
            $params['worker_id'] = $worker === false ? 0 : (int) $worker['id'];
        }

        $sql = <<<SQL
            SELECT
                c.*,
                ch.id AS child_id_r, ch.first_name AS child_first_name_r, ch.last_name AS child_last_name_r,
                ch.date_of_birth AS child_date_of_birth_r, ch.gender AS child_gender_r, ch.status AS child_status_r,
                ch.address AS child_address_r, ch.guardian_name AS child_guardian_name_r,
                ch.guardian_phone AS child_guardian_phone_r, ch.school_name AS child_school_name_r,
                ch.notes AS child_notes_r, ch.created_at AS child_created_at_r, ch.updated_at AS child_updated_at_r,
                w.id AS worker_id_r, w.first_name AS worker_first_name_r, w.last_name AS worker_last_name_r,
                w.email AS worker_email_r, w.phone AS worker_phone_r, w.role AS worker_role_r,
                w.department AS worker_department_r, w.status AS worker_status_r,
                w.created_at AS worker_created_at_r, w.updated_at AS worker_updated_at_r
            FROM cases c
            LEFT JOIN children ch ON c.child_id = ch.id
            LEFT JOIN workers w ON c.worker_id = w.id
            {$where}
            ORDER BY c.created_at ASC
        SQL;
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        Response::json(array_map('shapeCaseRow', $rows));
    } catch (\Throwable $e) {
        Response::error((string) $e, 500);
    }
});

$router->post('/cases', function () {
    try {
        $body = Utils::jsonBody();
        $columns = normalizeCaseColumns(Utils::bodyToColumns($body, CASES_COLUMNS));

        if (empty($columns['case_number'])) {
            $total = Model::count(CASES_TABLE);
            $columns['case_number'] = 'CASE-' . str_pad((string) ($total + 1), 4, '0', STR_PAD_LEFT);
        }

        $row = Model::insert(CASES_TABLE, $columns);
        Response::json(fetchCaseWithRelations((int) $row['id']), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

$router->get('/cases/:id', function (array $params) {
    $full = fetchCaseWithRelations((int) $params['id']);
    if ($full === null) {
        Response::error('Case not found', 404);
    }
    Response::json($full);
});

$router->patch('/cases/:id', function (array $params) {
    try {
        $id = (int) $params['id'];
        $columns = normalizeCaseColumns(Utils::bodyToColumns(Utils::jsonBody(), CASES_COLUMNS));

        // Closing a case stamps closed_at automatically (unless the caller
        // explicitly supplied one). Moving a case OUT of "closed" (e.g.
        // reopening it, or escalating a case someone closed by mistake)
        // clears closed_at again, since it's no longer accurate.
        if (isset($columns['status'])) {
            if ($columns['status'] === 'closed') {
                // Only a supervisor/admin may close a case that is
                // currently escalated. Fetch the pre-update row to check
                // its *current* status, not the one being requested.
                $existing = Model::find(CASES_TABLE, $id);
                if ($existing !== null && $existing['status'] === 'escalated') {
                    Auth::requireCaseClosePermission();
                }
                if (empty($columns['closed_at'])) {
                    $columns['closed_at'] = date('c');
                }
            } elseif (!array_key_exists('closed_at', $columns)) {
                $columns['closed_at'] = null;
            }
        }

        $row = Model::update(CASES_TABLE, $id, $columns);
        if ($row === null) {
            Response::error('Case not found', 404);
        }
        Response::json(fetchCaseWithRelations((int) $row['id']));
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});

// Only administrators can delete a case (destructive, irreversible action).
$router->delete('/cases/:id', function (array $params) {
    Auth::requireAdmin();
    $id = (int) $params['id'];
    Model::deleteWhere(CASE_NOTES_TABLE, 'case_id', $id);
    $row = Model::delete(CASES_TABLE, $id);
    if ($row === null) {
        Response::error('Case not found', 404);
    }
    Response::status(204);
});

$router->get('/cases/:id/notes', function (array $params) {
    $stmt = Database::connection()->prepare(
        'SELECT * FROM "case_notes" WHERE case_id = :id ORDER BY created_at ASC'
    );
    $stmt->execute(['id' => (int) $params['id']]);
    Response::json(Utils::rowsToApi($stmt->fetchAll()));
});

$router->post('/cases/:id/notes', function (array $params) {
    try {
        $columns = Utils::bodyToColumns(Utils::jsonBody(), CASE_NOTES_COLUMNS);
        $columns['case_id'] = (int) $params['id'];
        $note = Model::insert(CASE_NOTES_TABLE, $columns);
        Response::json(Utils::rowToApi($note), 201);
    } catch (\Throwable $e) {
        Response::error((string) $e, 400);
    }
});
