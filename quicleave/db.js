// Database Helper Functions
// This simulates database operations using localStorage

class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize users table
        if (!localStorage.getItem('users')) {
            const users = [
                {
                    id: 1,
                    userId: 'admin',
                    password: 'admin123',
                    fullName: 'System Administrator',
                    email: 'admin@lms.com',
                    department: 'Administration',
                    userType: 'admin',
                    registeredOn: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Initialize leaves table
        if (!localStorage.getItem('leaves')) {
            localStorage.setItem('leaves', JSON.stringify([]));
        }

        // Initialize leave counter
        if (!localStorage.getItem('leaveCounter')) {
            localStorage.setItem('leaveCounter', '1');
        }
    }

    // User Operations
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(user => user.userId === userId);
    }

    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    }

    createUser(userData) {
        const users = this.getAllUsers();
        
        // Check if user already exists
        if (this.getUserById(userData.userId)) {
            return { success: false, message: 'User ID already exists' };
        }
        
        if (this.getUserByEmail(userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: users.length + 1,
            ...userData,
            userType: userData.userType || 'user',
            registeredOn: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'User created successfully', user: newUser };
    }

    authenticateUser(userId, password, userType) {
        const user = this.getUserById(userId);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid password' };
        }

        if (user.userType !== userType) {
            return { success: false, message: `Invalid login type. Please login as ${user.userType}` };
        }

        return { success: true, message: 'Login successful', user: user };
    }

    deleteUser(userId) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(user => user.userId !== userId);
        
        if (users.length === filteredUsers.length) {
            return { success: false, message: 'User not found' };
        }

        localStorage.setItem('users', JSON.stringify(filteredUsers));
        return { success: true, message: 'User deleted successfully' };
    }

    // Leave Operations
    getAllLeaves() {
        return JSON.parse(localStorage.getItem('leaves') || '[]');
    }

    getLeavesByUserId(userId) {
        const leaves = this.getAllLeaves();
        return leaves.filter(leave => leave.userId === userId);
    }

    getLeaveById(leaveId) {
        const leaves = this.getAllLeaves();
        return leaves.find(leave => leave.id === parseInt(leaveId));
    }

    createLeave(leaveData) {
        const leaves = this.getAllLeaves();
        const counter = parseInt(localStorage.getItem('leaveCounter'));
        
        const newLeave = {
            id: counter,
            ...leaveData,
            status: 'Pending',
            appliedOn: new Date().toISOString(),
            remarks: ''
        };

        leaves.push(newLeave);
        localStorage.setItem('leaves', JSON.stringify(leaves));
        localStorage.setItem('leaveCounter', (counter + 1).toString());
        
        return { success: true, message: 'Leave application submitted successfully', leave: newLeave };
    }

    updateLeaveStatus(leaveId, status, remarks = '') {
        const leaves = this.getAllLeaves();
        const leaveIndex = leaves.findIndex(leave => leave.id === parseInt(leaveId));
        
        if (leaveIndex === -1) {
            return { success: false, message: 'Leave application not found' };
        }

        leaves[leaveIndex].status = status;
        leaves[leaveIndex].remarks = remarks;
        leaves[leaveIndex].actionDate = new Date().toISOString();

        localStorage.setItem('leaves', JSON.stringify(leaves));
        
        return { success: true, message: `Leave ${status.toLowerCase()} successfully`, leave: leaves[leaveIndex] };
    }

    // Utility Functions
    calculateDays(fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    }
}

// Create global database instance
const db = new Database();
