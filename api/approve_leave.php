<?php
require_once 'config.php';

$user = checkLogin();

if ($user['userType'] !== 'admin') {
    sendResponse(false, 'Access denied');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$leaveId = (int)($_POST['leaveId'] ?? 0);
$action = sanitizeInput($_POST['action'] ?? ''); // 'approve' or 'reject'
$remarks = sanitizeInput($_POST['remarks'] ?? '');

if ($leaveId <= 0 || !in_array($action, ['approve', 'reject'])) {
    sendResponse(false, 'Invalid parameters');
}

$status = $action === 'approve' ? 'Approved' : 'Rejected';

$conn = getDBConnection();

$stmt = $conn->prepare("UPDATE leaves SET status = ?, remarks = ?, actionDate = NOW() WHERE id = ?");
$stmt->bind_param("ssi", $status, $remarks, $leaveId);

if ($stmt->execute()) {
    sendResponse(true, "Leave application $action" . ($action === 'approve' ? 'd' : 'ed') . ' successfully');
} else {
    sendResponse(false, 'Failed to update leave status: ' . $conn->error);
}

$stmt->close();
$conn->close();
?>