// Load database
const script = document.createElement('script');
script.src = 'db.js';
document.head.appendChild(script);

// Wait for database to load
script.onload = function() {
    checkAuthentication();
    initializeLeaveHistory();
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

function initializeLeaveHistory() {
    const logoutBtn = document.getElementById('logoutBtn');
    const yearFilter = document.getElementById('yearFilter');

    // Populate year filter
    populateYearFilter();

    // Load leave history
    loadLeaveHistory('all');
    updateStatistics();

    // Filter functionality
    yearFilter.addEventListener('change', function() {
        loadLeaveHistory(this.value);
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

function populateYearFilter() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaves = db.getLeavesByUserId(currentUser.userId);
    const yearFilter = document.getElementById('yearFilter');
    const years = new Set();

    leaves.forEach(leave => {
        const year = new Date(leave.appliedOn).getFullYear();
        years.add(year);
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function loadLeaveHistory(year) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaves = db.getLeavesByUserId(currentUser.userId);
    const leaveHistoryBody = document.getElementById('leaveHistoryBody');

    // Filter leaves based on year
    let filteredLeaves = leaves;
    if (year !== 'all') {
        filteredLeaves = leaves.filter(leave => {
            const leaveYear = new Date(leave.appliedOn).getFullYear();
            return leaveYear === parseInt(year);
        });
    }

    // Sort by applied date (newest first)
    filteredLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

    if (filteredLeaves.length === 0) {
        leaveHistoryBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No leave history found
                </td>
            </tr>
        `;
        return;
    }

    leaveHistoryBody.innerHTML = '';

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

        leaveHistoryBody.appendChild(row);
    });
}

function updateStatistics() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaves = db.getLeavesByUserId(currentUser.userId);

    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(leave => leave.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(leave => leave.status === 'Rejected').length;
    const pendingLeaves = leaves.filter(leave => leave.status === 'Pending').length;

    document.getElementById('totalLeaves').textContent = totalLeaves;
    document.getElementById('approvedLeaves').textContent = approvedLeaves;
    document.getElementById('rejectedLeaves').textContent = rejectedLeaves;
    document.getElementById('pendingLeaves').textContent = pendingLeaves;
}
