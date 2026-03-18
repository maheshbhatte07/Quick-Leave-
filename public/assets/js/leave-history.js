document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    document.getElementById('userIdDisplay').textContent = currentUser.userId;

    const yearFilter = document.getElementById('yearFilter');
    const leaveHistoryTable = document.getElementById('leaveHistoryTable');
    const leaveHistoryBody = document.getElementById('leaveHistoryBody');

    // Stats elements
    const totalLeaves = document.getElementById('totalLeaves');
    const approvedLeaves = document.getElementById('approvedLeaves');
    const rejectedLeaves = document.getElementById('rejectedLeaves');
    const pendingLeaves = document.getElementById('pendingLeaves');

    // Populate year filter
    populateYearFilter();

    // Load leave history
    loadLeaveHistory();

    yearFilter.addEventListener('change', loadLeaveHistory);

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    function populateYearFilter() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 5; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    }

    function loadLeaveHistory() {
        const year = yearFilter.value;

        fetch(`../api/leave_history.php?year=${year}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayStats(data.data.stats);
                displayLeaveHistory(data.data.leaves);
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function displayStats(stats) {
        totalLeaves.textContent = stats.total || 0;
        approvedLeaves.textContent = stats.approved || 0;
        rejectedLeaves.textContent = stats.rejected || 0;
        pendingLeaves.textContent = stats.pending || 0;
    }

    function displayLeaveHistory(leaves) {
        leaveHistoryBody.innerHTML = '';

        if (leaves.length === 0) {
            const row = leaveHistoryBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 8;
            cell.textContent = 'No leave applications found.';
            cell.style.textAlign = 'center';
            return;
        }

        leaves.forEach(leave => {
            const row = leaveHistoryBody.insertRow();
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
