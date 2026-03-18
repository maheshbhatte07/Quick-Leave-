-- Leave Management System Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    userType ENUM('user', 'admin') NOT NULL,
    registeredOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    leaveType VARCHAR(50) NOT NULL,
    fromDate DATE NOT NULL,
    toDate DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    appliedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    actionDate TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Insert default admin user
INSERT IGNORE INTO users (userId, password, fullName, email, department, userType) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@lms.com', 'Administration', 'admin');
-- Password is 'password' hashed with bcrypt
