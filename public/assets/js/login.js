document.addEventListener('DOMContentLoaded', function() {
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

        // Create form data
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('password', password);
        formData.append('userType', userType);

        // Send login request
        fetch('../api/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');

                // Store session data
                sessionStorage.setItem('currentUser', JSON.stringify(data.data.user));
                sessionStorage.setItem('isLoggedIn', 'true');

                // Redirect based on user type
                setTimeout(() => {
                    if (userType === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'apply-leave.html';
                    }
                }, 1000);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        });
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
});
