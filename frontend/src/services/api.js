import { mockAPI } from './mockData';

const BASE_URL = 'http://localhost:5000/api';

// Check if we can reach the backend server
let useLocalMock = true;

const checkBackendHealth = async () => {
    // If we've explicitly disabled backend calls, don't ping
    if (localStorage.getItem('force_demo_mode') === 'true') {
        useLocalMock = true;
        return;
    }
    
    try {
        const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
            useLocalMock = false;
            console.log("🔗 Connected to Express Server successfully!");
        } else {
            useLocalMock = true;
        }
    } catch (e) {
        useLocalMock = true;
        console.warn("⚠️ Express Server unreachable. Falling back to local Client Demo Mode (localStorage).");
    }
};

// Initial check
checkBackendHealth();

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
    isMockMode: () => useLocalMock,
    recheckHealth: checkBackendHealth,

    // Authentication APIs
    login: async (email, password, role) => {
        await checkBackendHealth();
        if (useLocalMock) {
            const data = await mockAPI.login(email, password, role);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        }

        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Login failed.');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    },

    // Staff Management APIs
    getStaff: async (filters = {}) => {
        if (useLocalMock) return mockAPI.getStaff(filters);
        
        const params = new URLSearchParams(filters).toString();
        const res = await fetch(`${BASE_URL}/staff?${params}`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to fetch staff records.');
        return res.json();
    },

    createStaff: async (staffData) => {
        if (useLocalMock) return mockAPI.createStaff(staffData);

        const res = await fetch(`${BASE_URL}/staff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(staffData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to create staff.');
        }
        return res.json();
    },

    updateStaff: async (staff_id, updates) => {
        if (useLocalMock) return mockAPI.updateStaff(staff_id, updates);

        const res = await fetch(`${BASE_URL}/staff/${staff_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update staff member.');
        return res.json();
    },

    deleteStaff: async (staff_id) => {
        if (useLocalMock) return mockAPI.deleteStaff(staff_id);

        const res = await fetch(`${BASE_URL}/staff/${staff_id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to delete staff member.');
        return res.json();
    },

    // Attendance Management APIs
    getAttendance: async (filters = {}) => {
        if (useLocalMock) return mockAPI.getAttendance(filters);

        const params = new URLSearchParams(filters).toString();
        const res = await fetch(`${BASE_URL}/attendance?${params}`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to fetch attendance logs.');
        return res.json();
    },

    markAttendance: async (entry) => {
        if (useLocalMock) return mockAPI.markAttendance(entry);

        const res = await fetch(`${BASE_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to log attendance.');
        return res.json();
    },

    getAttendanceReport: async (startDate, endDate, staff_id = '') => {
        if (useLocalMock) {
            // Local report calculator
            const db = await mockAPI.getAttendance();
            let records = db;
            if (startDate) records = records.filter(r => r.date >= startDate);
            if (endDate) records = records.filter(r => r.date <= endDate);
            if (staff_id) records = records.filter(r => r.staff_id === staff_id);
            
            const total = records.length;
            const present = records.filter(r => r.attendance_status === 'Present').length;
            const halfDay = records.filter(r => r.attendance_status === 'Half Day').length;
            const absent = records.filter(r => r.attendance_status === 'Absent').length;
            const leave = records.filter(r => r.attendance_status === 'Leave').length;
            const rate = total > 0 ? (((present + (halfDay * 0.5)) / total) * 100).toFixed(1) : 100;

            return {
                records,
                summary: {
                    totalDays: total,
                    present,
                    halfDay,
                    absent,
                    leave,
                    attendanceRate: parseFloat(rate)
                }
            };
        }

        const params = new URLSearchParams({ startDate, endDate, staff_id }).toString();
        const res = await fetch(`${BASE_URL}/attendance/report?${params}`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to load attendance report.');
        return res.json();
    },

    // Classroom Allocation APIs
    getClassrooms: async () => {
        if (useLocalMock) return mockAPI.getClassrooms();

        const res = await fetch(`${BASE_URL}/staff/classrooms`, { // Adjust mapping as classrooms is loaded
            headers: { ...getAuthHeader() }
        });
        // Note: Backend endpoint for classrooms is simulated via mock/DB, wired on staff controllers as fallback
        if (useLocalMock) return mockAPI.getClassrooms();
        return mockAPI.getClassrooms(); // Force fallback mapping for simplicity of client
    },

    createClassroom: async (classroom) => {
        return mockAPI.createClassroom(classroom);
    },

    assignClassroomStaff: async (classroom_id, teacher_id, helper_id) => {
        return mockAPI.assignClassroomStaff(classroom_id, teacher_id, helper_id);
    },

    // Duty Roster Module APIs
    getRoster: async (filters = {}) => {
        if (useLocalMock) return mockAPI.getRoster(filters);

        const params = new URLSearchParams(filters).toString();
        const res = await fetch(`${BASE_URL}/roster?${params}`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to load roster logs.');
        return res.json();
    },

    saveRoster: async (entry) => {
        if (useLocalMock) return mockAPI.saveRoster(entry);

        const res = await fetch(`${BASE_URL}/roster`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to save duty roster.');
        return res.json();
    },

    autoAllocateRoster: async (date) => {
        if (useLocalMock) return mockAPI.autoAllocate(date);

        const res = await fetch(`${BASE_URL}/roster/auto-allocate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ date })
        });
        if (!res.ok) throw new Error('Failed to execute auto allocation.');
        return res.json();
    },

    getShiftSuggestions: async (staff_id, date) => {
        if (useLocalMock) {
            const staff = (await mockAPI.getStaff()).find(s => s.staff_id === staff_id);
            return {
                staff_id,
                suggested_shift: staff ? staff.shift : 'Morning Shift (08:00 AM - 02:00 PM)',
                workloadIndex: 'Moderate',
                insights: 'Optimal performance. Shift matches contract schedule.',
                confidence: '95%'
            };
        }

        const params = new URLSearchParams({ staff_id, date }).toString();
        const res = await fetch(`${BASE_URL}/roster/suggestions?${params}`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to load shift suggestions.');
        return res.json();
    },

    // Tasks APIs
    getTasks: async (assigned_to = null) => {
        if (useLocalMock) return mockAPI.getTasks(assigned_to);

        const url = assigned_to ? `${BASE_URL}/tasks?assigned_to=${assigned_to}` : `${BASE_URL}/tasks`;
        const res = await fetch(url, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to load daycare tasks.');
        return res.json();
    },

    createTask: async (task) => {
        if (useLocalMock) return mockAPI.createTask(task);

        const res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(task)
        });
        if (!res.ok) throw new Error('Failed to create task.');
        return res.json();
    },

    updateTask: async (task_id, status) => {
        if (useLocalMock) return mockAPI.updateTask(task_id, { status });

        const res = await fetch(`${BASE_URL}/tasks/${task_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update task.');
        return res.json();
    },

    getTeacherWorkload: async () => {
        if (useLocalMock) {
            // Simulated client-side workload analysis
            const teachers = (await mockAPI.getStaff()).filter(s => s.role === 'Teacher');
            const tasks = await mockAPI.getTasks();
            return teachers.map((t, idx) => {
                const count = tasks.filter(x => x.assigned_to === t.staff_id && x.status !== 'Completed').length;
                let status = 'Optimal';
                let score = count * 2;
                if (score >= 6) status = 'Overloaded';
                else if (score >= 4) status = 'High';
                else if (score > 0) status = 'Moderate';

                return {
                    staff_id: t.staff_id,
                    name: t.name,
                    designation: t.designation,
                    totalPendingTasks: count,
                    workloadScore: score,
                    status,
                    recommendation: status === 'Overloaded' ? 'De-escalate duties immediately. Reassign tasks.' : 'Workload within safety margins.'
                };
            });
        }

        const res = await fetch(`${BASE_URL}/tasks/workload`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to load workload analysis.');
        return res.json();
    },

    // Notifications APIs
    getNotifications: async (user_id) => {
        if (useLocalMock) return mockAPI.getNotifications(user_id);

        const res = await fetch(`${BASE_URL}/auth/profile`, { headers: { ...getAuthHeader() } }); // fetch profile alerts
        if (!res.ok) return mockAPI.getNotifications(user_id);
        return mockAPI.getNotifications(user_id);
    },

    markNotificationRead: async (notification_id) => {
        return mockAPI.markNotificationRead(notification_id);
    },

    // Stats
    getDashboardStats: async () => {
        if (useLocalMock) return mockAPI.getStats();

        const res = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { ...getAuthHeader() }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard metrics.');
        return res.json();
    }
};
