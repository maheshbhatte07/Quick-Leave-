// Load database
const script = document.createElement('script');
script.src = 'db.js';
document.head.appendChild(script);

// Wait for database to load
script.onload = function() {
    initializeLogin();
};

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        // Validate inputs
        if (!userId || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Authenticate user
        const result = db.authenticateUser(userId, password, userType);

        if (result.success) {
            // Store session data
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            sessionStorage.setItem('isLoggedIn', 'true');

            showMessage(result.message, 'success');

            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'apply-leave.html';
                }
            }, 1000);
        } else {
            showMessage(result.message, 'error');
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
