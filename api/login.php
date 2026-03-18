<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$userId = sanitizeInput($_POST['userId'] ?? '');
$password = $_POST['password'] ?? '';
$userType = sanitizeInput($_POST['userType'] ?? '');

if (empty($userId) || empty($password) || empty($userType)) {
    sendResponse(false, 'Please fill in all fields');
}

$conn = getDBConnection();

$stmt = $conn->prepare("SELECT id, userId, password, fullName, email, department, userType FROM users WHERE userId = ? AND userType = ?");
$stmt->bind_param("ss", $userId, $userType);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        // Start session
        session_start();
        $_SESSION['user'] = [
            'id' => $user['id'],
            'userId' => $user['userId'],
            'fullName' => $user['fullName'],
            'email' => $user['email'],
            'department' => $user['department'],
            'userType' => $user['userType']
        ];

        sendResponse(true, 'Login successful', ['user' => $_SESSION['user']]);
    } else {
        sendResponse(false, 'Invalid password');
    }
} else {
    sendResponse(false, 'User not found');
}

$stmt->close();
$conn->close();
?>