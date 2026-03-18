<?php
require_once 'config.php';

$user = checkLogin();

$statusFilter = sanitizeInput($_GET['status'] ?? 'all');

$conn = getDBConnection();

$query = "SELECT id, leaveType, fromDate, toDate, days, appliedOn, status, remarks FROM leaves WHERE userId = ?";
$params = [$user['userId']];
$types = "s";

if ($statusFilter !== 'all') {
    $query .= " AND status = ?";
    $params[] = $statusFilter;
    $types .= "s";
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

sendResponse(true, 'Leave applications retrieved successfully', ['leaves' => $leaves]);

$stmt->close();
$conn->close();
?>