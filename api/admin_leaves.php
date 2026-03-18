<?php
require_once 'config.php';

$user = checkLogin();

if ($user['userType'] !== 'admin') {
    sendResponse(false, 'Access denied');
}

$statusFilter = sanitizeInput($_GET['status'] ?? 'Pending');

$conn = getDBConnection();

$query = "SELECT id, userId, userName, department, leaveType, fromDate, toDate, days, reason, appliedOn, status, remarks FROM leaves";
$params = [];
$types = "";

if ($statusFilter !== 'all') {
    $query .= " WHERE status = ?";
    $params[] = $statusFilter;
    $types = "s";
}

$query .= " ORDER BY appliedOn DESC";

$stmt = $conn->prepare($query);
if (!empty($types)) {
    $stmt->bind_param($types, ...$params);
}
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