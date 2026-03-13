// Load database
const script = document.createElement('script');
script.src = 'db.js';
document.head.appendChild(script);

// Wait for database to load
script.onload = function() {
    checkAuthentication();
    initializeLeaveStatus();
};

function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!isLoggedIn || !currentUser || currentUser.userType !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    document.getElementById('userIdDisplay').textContent = currentUser.userId;
}

function initializeLeaveStatus() {
    const logoutBtn = document.getElementById('logoutBtn');
    const statusFilter = document.getElementById('statusFilter');

    // Load leave applications
    loadLeaveStatus('all');

    // Filter functionality
    statusFilter.addEventListener('change', function() {
        loadLeaveStatus(this.value);
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

function loadLeaveStatus(filter) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaves = db.getLeavesByUserId(currentUser.userId);
    const leaveStatusBody = document.getElementById('leaveStatusBody');
    const messageDiv = document.getElementById('message');

    // Filter leaves based on status
    let filteredLeaves = leaves;
    if (filter !== 'all') {
        filteredLeaves = leaves.filter(leave => leave.status === filter);
    }

    // Sort by applied date (newest first)
    filteredLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

    if (filteredLeaves.length === 0) {
        leaveStatusBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No leave applications found
                </td>
            </tr>
        `;
        return;
    }

    leaveStatusBody.innerHTML = '';

    filteredLeaves.forEach(leave => {
        const row = document.createElement('tr');
        
        const appliedDate = new Date(leave.appliedOn).toLocaleDateString();
        const statusClass = `status-${leave.status.toLowerCase()}`;

        row.innerHTML = `
            <td>${leave.id}</td>
            <td>${leave.leaveType}</td>
            <td>${leave.fromDate}</td>
            <td>${leave.toDate}</td>
            <td>${leave.days}</td>
            <td>${appliedDate}</td>
            <td><span class="status-badge ${statusClass}">${leave.status}</span></td>
            <td>${leave.remarks || '-'}</td>
        `;

        leaveStatusBody.appendChild(row);
    });
}
