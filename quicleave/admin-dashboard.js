// Load database
const script = document.createElement('script');
script.src = 'db.js';
document.head.appendChild(script);

let currentLeaveId = null;

// Wait for database to load
script.onload = function() {
    checkAuthentication();
    initializeAdminDashboard();
};

function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!isLoggedIn || !currentUser || currentUser.userType !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Display admin info
    document.getElementById('adminName').textContent = currentUser.fullName;
}

function initializeAdminDashboard() {
    const logoutBtn = document.getElementById('logoutBtn');
    const statusFilterAdmin = document.getElementById('statusFilterAdmin');
    const createUserForm = document.getElementById('createUserForm');
    const modal = document.getElementById('leaveModal');
    const closeModal = document.querySelector('.close');
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load respective data
            if (tabName === 'leaves') {
                loadLeaveApplications('Pending');
            } else if (tabName === 'users') {
                loadUsers();
            }
        });
    });

    // Load initial data
    loadLeaveApplications('Pending');

    // Filter functionality
    statusFilterAdmin.addEventListener('change', function() {
        loadLeaveApplications(this.value);
    });

    // Create user form
    createUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewUser();
    });

    // Modal functionality
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        currentLeaveId = null;
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            currentLeaveId = null;
        }
    });

    approveBtn.addEventListener('click', function() {
        updateLeaveStatus('Approved');
    });

    rejectBtn.addEventListener('click', function() {
        updateLeaveStatus('Rejected');
    });

    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        currentLeaveId = null;
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

function loadLeaveApplications(filter) {
    const leaves = db.getAllLeaves();
    const adminLeaveBody = document.getElementById('adminLeaveBody');

    // Filter leaves based on status
    let filteredLeaves = filter === 'all' ? leaves : leaves.filter(leave => leave.status === filter);

    // Sort by applied date (newest first)
    filteredLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

    if (filteredLeaves.length === 0) {
        adminLeaveBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 20px;">
                    No leave applications found
                </td>
            </tr>
        `;
        return;
    }

    adminLeaveBody.innerHTML = '';

    filteredLeaves.forEach(leave => {
        const row = document.createElement('tr');
        
        const appliedDate = new Date(leave.appliedOn).toLocaleDateString();
        const statusClass = `status-${leave.status.toLowerCase()}`;

        row.innerHTML = `
            <td>${leave.id}</td>
            <td>${leave.userId}</td>
            <td>${leave.userName}</td>
            <td>${leave.leaveType}</td>
            <td>${leave.fromDate}</td>
            <td>${leave.toDate}</td>
            <td>${leave.days}</td>
            <td>${leave.reason}</td>
            <td>${appliedDate}</td>
            <td><span class="status-badge ${statusClass}">${leave.status}</span></td>
            <td>
                ${leave.status === 'Pending' ? `
                    <button class="btn btn-action btn-success" onclick="openLeaveModal(${leave.id})">
                        Review
                    </button>
                ` : '<span>-</span>'}
            </td>
        `;

        adminLeaveBody.appendChild(row);
    });
}

function openLeaveModal(leaveId) {
    currentLeaveId = leaveId;
    const modal = document.getElementById('leaveModal');
    const leave = db.getLeaveById(leaveId);
    
    if (leave) {
        document.getElementById('modalTitle').textContent = `Review Leave Application #${leave.id}`;
        document.getElementById('actionRemarks').value = '';
        modal.style.display = 'block';
    }
}

function updateLeaveStatus(status) {
    if (!currentLeaveId) return;

    const remarks = document.getElementById('actionRemarks').value.trim();
    const result = db.updateLeaveStatus(currentLeaveId, status, remarks);

    if (result.success) {
        showMessage(result.message, 'success');
        const modal = document.getElementById('leaveModal');
        modal.style.display = 'none';
        currentLeaveId = null;
        
        // Reload leave applications
        const filter = document.getElementById('statusFilterAdmin').value;
        loadLeaveApplications(filter);
    } else {
        showMessage(result.message, 'error');
    }
}

function loadUsers() {
    const users = db.getAllUsers().filter(user => user.userType === 'user');
    const usersBody = document.getElementById('usersBody');

    if (users.length === 0) {
        usersBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    usersBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        
        const registeredDate = new Date(user.registeredOn).toLocaleDateString();

        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.department}</td>
            <td>${registeredDate}</td>
            <td>
                <button class="btn btn-action btn-danger" onclick="deleteUserConfirm('${user.userId}')">
                    Delete
                </button>
            </td>
        `;

        usersBody.appendChild(row);
    });
}

function createNewUser() {
    const fullName = document.getElementById('newFullName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const userId = document.getElementById('newUserId').value.trim();
    const password = document.getElementById('newPassword').value;
    const department = document.getElementById('newDepartment').value.trim();

    // Validate inputs
    if (!fullName || !email || !userId || !password || !department) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    // Create user
    const userData = {
        userId: userId,
        password: password,
        fullName: fullName,
        email: email,
        department: department,
        userType: 'user'
    };

    const result = db.createUser(userData);

    if (result.success) {
        showMessage('User created successfully!', 'success');
        
        // Clear form
        document.getElementById('createUserForm').reset();

        // Reload users
        loadUsers();
    } else {
        showMessage(result.message, 'error');
    }
}

function deleteUserConfirm(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        const result = db.deleteUser(userId);
        
        if (result.success) {
            showMessage(result.message, 'success');
            loadUsers();
        } else {
            showMessage(result.message, 'error');
        }
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
