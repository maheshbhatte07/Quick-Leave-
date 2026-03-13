// Load database
const script = document.createElement('script');
script.src = 'db.js';
document.head.appendChild(script);

// Wait for database to load
script.onload = function() {
    checkAuthentication();
    initializeApplyLeave();
};

function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!isLoggedIn || !currentUser || currentUser.userType !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    // Display user info
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('userIdDisplay').textContent = currentUser.userId;
}

function initializeApplyLeave() {
    const applyLeaveForm = document.getElementById('applyLeaveForm');
    const messageDiv = document.getElementById('message');
    const logoutBtn = document.getElementById('logoutBtn');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fromDate').setAttribute('min', today);
    document.getElementById('toDate').setAttribute('min', today);

    // Update toDate minimum when fromDate changes
    document.getElementById('fromDate').addEventListener('change', function() {
        document.getElementById('toDate').setAttribute('min', this.value);
    });

    applyLeaveForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const leaveType = document.getElementById('leaveType').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const reason = document.getElementById('reason').value.trim();

        // Validate dates
        if (new Date(toDate) < new Date(fromDate)) {
            showMessage('To Date must be greater than or equal to From Date', 'error');
            return;
        }

        // Calculate number of days
        const days = db.calculateDays(fromDate, toDate);

        // Create leave application
        const leaveData = {
            userId: currentUser.userId,
            userName: currentUser.fullName,
            department: currentUser.department,
            leaveType: leaveType,
            fromDate: fromDate,
            toDate: toDate,
            days: days,
            reason: reason
        };

        const result = db.createLeave(leaveData);

        if (result.success) {
            showMessage('Leave application submitted successfully!', 'success');
            applyLeaveForm.reset();

            // Redirect to leave status after 2 seconds
            setTimeout(() => {
                window.location.href = 'leave-status.html';
            }, 2000);
        } else {
            showMessage(result.message, 'error');
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'index.html';
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
