<?php
require_once 'config.php';

$user = checkLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$leaveType = sanitizeInput($_POST['leaveType'] ?? '');
$fromDate = sanitizeInput($_POST['fromDate'] ?? '');
$toDate = sanitizeInput($_POST['toDate'] ?? '');
$reason = sanitizeInput($_POST['reason'] ?? '');

if (empty($leaveType) || empty($fromDate) || empty($toDate) || empty($reason)) {
    sendResponse(false, 'Please fill in all fields');
}

// Validate dates
$fromDateObj = new DateTime($fromDate);
$toDateObj = new DateTime($toDate);

if ($toDateObj < $fromDateObj) {
    sendResponse(false, 'To date cannot be before from date');
}

// Calculate days (including weekends)
$interval = $fromDateObj->diff($toDateObj);
$days = $interval->days + 1; // +1 to include both start and end dates

$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO leaves (userId, userName, department, leaveType, fromDate, toDate, days, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssis", $user['userId'], $user['fullName'], $user['department'], $leaveType, $fromDate, $toDate, $days, $reason);

if ($stmt->execute()) {
    sendResponse(true, 'Leave application submitted successfully');
} else {
    sendResponse(false, 'Failed to submit leave application: ' . $conn->error);
}

$stmt->close();
$conn->close();
?>