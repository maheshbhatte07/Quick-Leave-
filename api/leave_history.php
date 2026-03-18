<?php
require_once 'config.php';

$user = checkLogin();

$yearFilter = sanitizeInput($_GET['year'] ?? 'all');

$conn = getDBConnection();

// Get statistics
$statsQuery = "SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
    FROM leaves WHERE userId = ?";

if ($yearFilter !== 'all') {
    $statsQuery .= " AND YEAR(appliedOn) = ?";
}

$stmt = $conn->prepare($statsQuery);
if ($yearFilter !== 'all') {
    $stmt->bind_param("si", $user['userId'], $yearFilter);
} else {
    $stmt->bind_param("s", $user['userId']);
}
$stmt->execute();
$statsResult = $stmt->get_result();
$stats = $statsResult->fetch_assoc();

// Get leave history
$query = "SELECT id, leaveType, fromDate, toDate, days, appliedOn, status, remarks FROM leaves WHERE userId = ?";
$params = [$user['userId']];
$types = "s";

if ($yearFilter !== 'all') {
    $query .= " AND YEAR(appliedOn) = ?";
    $params[] = $yearFilter;
    $types .= "i";
}

$query .= " ORDER BY appliedOn DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$leaves = [];
while ($row = $result->fetch_assoc()) {
    $leaves[] = $row;
}

sendResponse(true, 'Leave history retrieved successfully', [
    'stats' => $stats,
    'leaves' => $leaves
]);

$stmt->close();
$conn->close();
?>