document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('userIdDisplay').textContent = currentUser.userId;

    const applyLeaveForm = document.getElementById('applyLeaveForm');
    const messageDiv = document.getElementById('message');

    applyLeaveForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const leaveType = document.getElementById('leaveType').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const reason = document.getElementById('reason').value.trim();

        // Validate inputs
        if (!leaveType || !fromDate || !toDate || !reason) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('leaveType', leaveType);
        formData.append('fromDate', fromDate);
        formData.append('toDate', toDate);
        formData.append('reason', reason);

        // Send apply leave request
        fetch('../api/apply_leave.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                applyLeaveForm.reset();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        });
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    function logout() {
        fetch('../api/logout.php')
        .then(response => response.json())
        .then(data => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error:', error);
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
});
