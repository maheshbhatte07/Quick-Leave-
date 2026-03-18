document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    document.getElementById('userIdDisplay').textContent = currentUser.userId;

    const statusFilter = document.getElementById('statusFilter');
    const leaveStatusTable = document.getElementById('leaveStatusTable');
    const leaveStatusBody = document.getElementById('leaveStatusBody');
    const messageDiv = document.getElementById('message');

    // Load leave applications
    loadLeaveApplications();

    statusFilter.addEventListener('change', loadLeaveApplications);

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    function loadLeaveApplications() {
        const status = statusFilter.value;

        fetch(`../api/leave_status.php?status=${status}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLeaveApplications(data.data.leaves);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        });
    }

    function displayLeaveApplications(leaves) {
        leaveStatusBody.innerHTML = '';

        if (leaves.length === 0) {
            const row = leaveStatusBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 8;
            cell.textContent = 'No leave applications found.';
            cell.style.textAlign = 'center';
            return;
        }

        leaves.forEach(leave => {
            const row = leaveStatusBody.insertRow();
            row.insertCell(0).textContent = leave.id;
            row.insertCell(1).textContent = leave.leaveType;
            row.insertCell(2).textContent = formatDate(leave.fromDate);
            row.insertCell(3).textContent = formatDate(leave.toDate);
            row.insertCell(4).textContent = leave.days;
            row.insertCell(5).textContent = formatDateTime(leave.appliedOn);
            row.insertCell(6).textContent = leave.status;
            row.insertCell(7).textContent = leave.remarks || '';
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

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
