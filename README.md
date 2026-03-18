# Leave Management System

PHP + MySQL leave management system with a simple HTML/JS frontend.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx) with PHP support

## Project Structure

- `public/` UI pages
- `public/assets/` CSS and JavaScript
- `api/` PHP endpoints
- `database/` SQL schema
- `docs/` documentation

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database named `leave_management`
2. Run the SQL script in `database/schema.sql` to create tables and insert default data

```sql
-- Run this in MySQL
source database/schema.sql;
```

Or copy and paste the contents of `database/schema.sql` into your MySQL client.

### 2. Configuration

Edit `api/config.php` to match your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_mysql_username');
define('DB_PASS', 'your_mysql_password');
define('DB_NAME', 'leave_management');
```

### 3. File Permissions

Ensure the web server has write permissions to the directory if needed (though this backend doesn't require file writes).

### 4. Default Admin Login

- **User ID:** admin
- **Password:** password

**Important:** Change the default admin password after first login for security.

## API Endpoints

### Authentication
- `POST /api/login.php` - User login
  - Parameters: userId, password, userType

### User Functions
- `POST /api/apply_leave.php` - Submit leave application
  - Parameters: leaveType, fromDate, toDate, reason
- `GET /api/leave_status.php` - Get user's leave applications
  - Query: status (optional filter)
- `GET /api/leave_history.php` - Get user's leave history with statistics
  - Query: year (optional filter)

### Admin Functions
- `GET /api/admin_leaves.php` - Get all leave applications
  - Query: status (optional filter)
- `POST /api/approve_leave.php` - Approve or reject leave
  - Parameters: leaveId, action (approve/reject), remarks
- `POST /api/create_user.php` - Create new user
  - Parameters: fullName, email, userId, password, department

### Session Management
- `GET /api/logout.php` - Logout user

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- Input sanitization
- SQL injection prevention with prepared statements
- Access control for admin functions

## Frontend Integration

The JavaScript files have been updated to use AJAX calls to these PHP endpoints instead of LocalStorage.

## Testing

1. Start your web server
2. Access `public/index.html` in your browser (served by Apache/IIS)
3. Login with admin/password
4. Test user creation and leave applications

## Notes

- Frontend HTML lives under `public/`
- JavaScript calls the PHP endpoints under `api/`
- All dates are handled in YYYY-MM-DD format
- Passwords are hashed and cannot be retrieved in plain text
