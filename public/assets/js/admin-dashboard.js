document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.userType !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Display admin name
    document.getElementById('adminName').textContent = currentUser.fullName;

    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const statusFilterAdmin = document.getElementById('statusFilterAdmin');
    const adminLeaveTable = document.getElementById('adminLeaveTable');
    const adminLeaveBody = document.getElementById('adminLeaveBody');
    const createUserForm = document.getElementById('createUserForm');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');

            // Load data for the tab
            if (tabName === 'leaves') {
                loadLeaveApplications();
            }
        });
    });

    // Load leave applications on page load
    loadLeaveApplications();

    statusFilterAdmin.addEventListener('change', loadLeaveApplications);

    // Create user form
    createUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createUser();
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    function loadLeaveApplications() {
        const status = statusFilterAdmin.value;

        fetch(`../api/admin_leaves.php?status=${status}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLeaveApplications(data.data.leaves);
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function displayLeaveApplications(leaves) {
        adminLeaveBody.innerHTML = '';

        if (leaves.length === 0) {
            const row = adminLeaveBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 11;
            cell.textContent = 'No leave applications found.';
            cell.style.textAlign = 'center';
            return;
        }

        leaves.forEach(leave => {
            const row = adminLeaveBody.insertRow();
            row.insertCell(0).textContent = leave.id;
            row.insertCell(1).textContent = leave.userId;
            row.insertCell(2).textContent = leave.userName;
            row.insertCell(3).textContent = leave.leaveType;
            row.insertCell(4).textContent = formatDate(leave.fromDate);
            row.insertCell(5).textContent = formatDate(leave.toDate);
            row.insertCell(6).textContent = leave.days;
            row.insertCell(7).textContent = leave.reason;
            row.insertCell(8).textContent = formatDateTime(leave.appliedOn);
            row.insertCell(9).textContent = leave.status;

            // Actions cell
            const actionsCell = row.insertCell(10);
            if (leave.status === 'Pending') {
                actionsCell.innerHTML = `
                    <button class="btn btn-small btn-success" onclick="approveLeave(${leave.id})">Approve</button>
                    <button class="btn btn-small btn-danger" onclick="rejectLeave(${leave.id})">Reject</button>
                `;
            } else {
                actionsCell.textContent = '-';
            }
        });
    }

    function createUser() {
        const fullName = document.getElementById('newFullName').value.trim();
        const email = document.getElementById('newEmail').value.trim();
        const userId = document.getElementById('newUserId').value.trim();
        const password = document.getElementById('newPassword').value;
        const department = document.getElementById('newDepartment').value.trim();

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('userId', userId);
        formData.append('password', password);
        formData.append('department', department);

        fetch('../api/create_user.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                createUserForm.reset();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
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

// Global functions for approve/reject buttons
function approveLeave(leaveId) {
    const remarks = prompt('Enter remarks (optional):') || '';
    const formData = new FormData();
    formData.append('leaveId', leaveId);
    formData.append('action', 'approve');
    formData.append('remarks', remarks);

    fetch('../api/approve_leave.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function rejectLeave(leaveId) {
    const remarks = prompt('Enter remarks (required for rejection):');
    if (!remarks) {
        alert('Remarks are required for rejection.');
        return;
    }

    const formData = new FormData();
    formData.append('leaveId', leaveId);
    formData.append('action', 'reject');
    formData.append('remarks', remarks);

    fetch('../api/approve_leave.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
