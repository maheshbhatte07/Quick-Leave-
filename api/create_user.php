<?php
require_once 'config.php';

$user = checkLogin();

if ($user['userType'] !== 'admin') {
    sendResponse(false, 'Access denied');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$fullName = sanitizeInput($_POST['fullName'] ?? '');
$email = sanitizeInput($_POST['email'] ?? '');
$userId = sanitizeInput($_POST['userId'] ?? '');
$password = $_POST['password'] ?? '';
$department = sanitizeInput($_POST['department'] ?? '');

if (empty($fullName) || empty($email) || empty($userId) || empty($password) || empty($department)) {
    sendResponse(false, 'Please fill in all fields');
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format');
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO users (userId, password, fullName, email, department, userType) VALUES (?, ?, ?, ?, ?, 'user')");
$stmt->bind_param("sssss", $userId, $hashedPassword, $fullName, $email, $department);

if ($stmt->execute()) {
    sendResponse(true, 'User created successfully');
} else {
    sendResponse(false, 'Failed to create user: ' . $conn->error);
}

$stmt->close();
$conn->close();
?>