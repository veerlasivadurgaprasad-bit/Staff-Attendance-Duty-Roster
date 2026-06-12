const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFilePath = path.join(__dirname, '../data/db.json');
const dbDir = path.dirname(dbFilePath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initial seed data matching the SQL schema
const getInitialData = () => {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const headHash = bcrypt.hashSync('head123', salt);
    const teacherHash = bcrypt.hashSync('teacher123', salt);
    const helperHash = bcrypt.hashSync('helper123', salt);

    return {
        users: [
            { id: 1, name: 'Admin User', email: 'admin@firstcry.com', password: adminHash, role: 'Admin', created_at: new Date().toISOString() },
            { id: 2, name: 'Priya Sharma', email: 'priya.sharma@firstcry.com', password: headHash, role: 'Centre Head', created_at: new Date().toISOString() },
            { id: 3, name: 'Ananya Sen', email: 'ananya.sen@firstcry.com', password: teacherHash, role: 'Teacher', created_at: new Date().toISOString() },
            { id: 4, name: 'Meera Nair', email: 'meera.nair@firstcry.com', password: teacherHash, role: 'Teacher', created_at: new Date().toISOString() },
            { id: 5, name: 'Sita Devi', email: 'sita.devi@firstcry.com', password: helperHash, role: 'Helper', created_at: new Date().toISOString() },
            { id: 6, name: 'Rani Mukherji', email: 'rani.m@firstcry.com', password: helperHash, role: 'Helper', created_at: new Date().toISOString() }
        ],
        staff: [
            { staff_id: 'T-001', user_id: 3, designation: 'Toddler Lead Teacher', department: 'Early Years', phone: '9876543210', shift: 'Morning Shift (08:00 AM - 02:00 PM)', status: 'Active' },
            { staff_id: 'T-002', user_id: 4, designation: 'Preschool Teacher', department: 'Preschool', phone: '9876543211', shift: 'General Shift (09:00 AM - 05:00 PM)', status: 'Active' },
            { staff_id: 'H-001', user_id: 5, designation: 'Classroom Attendant', department: 'Daycare Support', phone: '9876543212', shift: 'Morning Shift (08:00 AM - 02:00 PM)', status: 'Active' },
            { staff_id: 'H-002', user_id: 6, designation: 'Daycare Helper', department: 'Daycare Support', phone: '9876543213', shift: 'Daycare Shift (10:00 AM - 07:00 PM)', status: 'Active' }
        ],
        classrooms: [
            { classroom_id: 1, classroom_name: 'Playgroup - Nestling', teacher_id: 'T-001', helper_id: 'H-001', capacity: 12, status: 'Active' },
            { classroom_id: 2, classroom_name: 'Nursery - Fledglings', teacher_id: 'T-002', helper_id: 'H-002', capacity: 15, status: 'Active' },
            { classroom_id: 3, classroom_name: 'Daycare - Cozy Cabin', teacher_id: null, helper_id: null, capacity: 20, status: 'Active' }
        ],
        attendance: [
            { attendance_id: 1, staff_id: 'T-001', date: '2026-06-11', check_in: '07:55:00', check_out: '14:05:00', attendance_status: 'Present' },
            { attendance_id: 2, staff_id: 'T-002', date: '2026-06-11', check_in: '08:58:00', check_out: '17:02:00', attendance_status: 'Present' },
            { attendance_id: 3, staff_id: 'H-001', date: '2026-06-11', check_in: '08:10:00', check_out: '14:00:00', attendance_status: 'Present' },
            { attendance_id: 4, staff_id: 'H-002', date: '2026-06-11', check_in: null, check_out: null, attendance_status: 'Absent' },
            { attendance_id: 5, staff_id: 'T-001', date: '2026-06-12', check_in: '07:52:00', check_out: null, attendance_status: 'Present' },
            { attendance_id: 6, staff_id: 'T-002', date: '2026-06-12', check_in: '09:05:00', check_out: null, attendance_status: 'Present' },
            { attendance_id: 7, staff_id: 'H-001', date: '2026-06-12', check_in: null, check_out: null, attendance_status: 'Leave' }
        ],
        duty_roster: [
            { roster_id: 1, staff_id: 'T-001', classroom_id: 1, shift: 'Morning Shift (08:00 AM - 02:00 PM)', assigned_date: '2026-06-12' },
            { roster_id: 2, staff_id: 'T-002', classroom_id: 2, shift: 'General Shift (09:00 AM - 05:00 PM)', assigned_date: '2026-06-12' },
            { roster_id: 3, staff_id: 'H-001', classroom_id: 1, shift: 'Morning Shift (08:00 AM - 02:00 PM)', assigned_date: '2026-06-12' },
            { roster_id: 4, staff_id: 'H-002', classroom_id: 3, shift: 'Daycare Shift (10:00 AM - 07:00 PM)', assigned_date: '2026-06-12' }
        ],
        tasks: [
            { task_id: 1, assigned_to: 'T-001', title: 'Sanitize Learning Material', description: 'Disinfect all wooden blocks and sensory play materials in the Nursery classroom.', priority: 'High', due_date: '2026-06-12', status: 'Pending' },
            { task_id: 2, assigned_to: 'T-002', title: 'Prepare Weekly Lesson Plan', description: 'Upload lesson plan for Next Week theme (Animals & Habitats).', priority: 'Medium', due_date: '2026-06-14', status: 'In Progress' },
            { task_id: 3, assigned_to: 'H-002', title: 'Mid-day Meal Service Prep', description: 'Arrange high chairs and assist in feeding the Toddler group with milk & fruit puree.', priority: 'High', due_date: '2026-06-12', status: 'Pending' }
        ],
        notifications: [
            { notification_id: 1, user_id: 3, message: 'Welcome! You have been assigned to Playgroup - Nestling for the morning shift today.', type: 'Duty Change', created_at: new Date().toISOString(), is_read: false },
            { notification_id: 2, user_id: 5, message: 'Your leave request for June 12, 2026, has been approved by the Centre Head.', type: 'Attendance', created_at: new Date().toISOString(), is_read: false },
            { notification_id: 3, user_id: 1, message: 'Staff shortage warning: Helper H-001 is on leave. High priority tasks reassigned.', type: 'Shift Alert', created_at: new Date().toISOString(), is_read: false }
        ]
    };
};

const readDB = () => {
    if (!fs.existsSync(dbFilePath)) {
        const data = getInitialData();
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
        return data;
    }
    try {
        const dataStr = fs.readFileSync(dbFilePath, 'utf8');
        return JSON.parse(dataStr);
    } catch (error) {
        console.error("Error reading db.json, resetting database:", error);
        const data = getInitialData();
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
        return data;
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing to db.json:", error);
        return false;
    }
};

// Database Query Helpers
const db = {
    // Users
    findUserByEmail: async (email) => {
        const data = readDB();
        return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    findUserById: async (id) => {
        const data = readDB();
        return data.users.find(u => u.id === parseInt(id));
    },
    createUser: async (user) => {
        const data = readDB();
        const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        const newUser = { id: newId, ...user, created_at: new Date().toISOString() };
        data.users.push(newUser);
        writeDB(data);
        return newUser;
    },

    // Staff
    getAllStaff: async () => {
        const data = readDB();
        return data.staff.map(s => {
            const user = data.users.find(u => u.id === s.user_id);
            return {
                ...s,
                name: user ? user.name : 'Unknown',
                email: user ? user.email : '',
                role: user ? user.role : ''
            };
        });
    },
    getStaffById: async (staff_id) => {
        const data = readDB();
        const s = data.staff.find(x => x.staff_id === staff_id);
        if (!s) return null;
        const user = data.users.find(u => u.id === s.user_id);
        return {
            ...s,
            name: user ? user.name : 'Unknown',
            email: user ? user.email : '',
            role: user ? user.role : ''
        };
    },
    createStaff: async (staffData, userData) => {
        const data = readDB();
        
        // 1. Create user
        const newUserId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(userData.password || 'staff123', salt);
        
        const newUser = {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            password: passwordHash,
            role: userData.role,
            created_at: new Date().toISOString()
        };
        data.users.push(newUser);

        // 2. Create staff profile
        const newStaff = {
            staff_id: staffData.staff_id,
            user_id: newUserId,
            designation: staffData.designation,
            department: staffData.department,
            phone: staffData.phone,
            shift: staffData.shift,
            status: staffData.status || 'Active'
        };
        data.staff.push(newStaff);
        
        writeDB(data);
        return { ...newStaff, name: newUser.name, email: newUser.email, role: newUser.role };
    },
    updateStaff: async (staff_id, updateData) => {
        const data = readDB();
        const staffIndex = data.staff.findIndex(s => s.staff_id === staff_id);
        if (staffIndex === -1) return null;

        const staffRecord = data.staff[staffIndex];
        const userIndex = data.users.findIndex(u => u.id === staffRecord.user_id);

        if (updateData.name && userIndex !== -1) data.users[userIndex].name = updateData.name;
        if (updateData.email && userIndex !== -1) data.users[userIndex].email = updateData.email;
        if (updateData.role && userIndex !== -1) data.users[userIndex].role = updateData.role;
        if (updateData.password && userIndex !== -1) {
            const salt = bcrypt.genSaltSync(10);
            data.users[userIndex].password = bcrypt.hashSync(updateData.password, salt);
        }

        if (updateData.designation !== undefined) staffRecord.designation = updateData.designation;
        if (updateData.department !== undefined) staffRecord.department = updateData.department;
        if (updateData.phone !== undefined) staffRecord.phone = updateData.phone;
        if (updateData.shift !== undefined) staffRecord.shift = updateData.shift;
        if (updateData.status !== undefined) staffRecord.status = updateData.status;

        data.staff[staffIndex] = staffRecord;
        writeDB(data);
        return {
            ...staffRecord,
            name: userIndex !== -1 ? data.users[userIndex].name : '',
            email: userIndex !== -1 ? data.users[userIndex].email : '',
            role: userIndex !== -1 ? data.users[userIndex].role : ''
        };
    },
    deleteStaff: async (staff_id) => {
        const data = readDB();
        const staffIndex = data.staff.findIndex(s => s.staff_id === staff_id);
        if (staffIndex === -1) return false;

        const staffRecord = data.staff[staffIndex];
        
        // Remove user
        data.users = data.users.filter(u => u.id !== staffRecord.user_id);
        // Remove staff profile
        data.staff = data.staff.filter(s => s.staff_id !== staff_id);
        
        writeDB(data);
        return true;
    },

    // Attendance
    getAttendance: async (date) => {
        const data = readDB();
        let list = data.attendance;
        if (date) {
            list = list.filter(a => a.date === date);
        }
        return list.map(a => {
            const staffRecord = data.staff.find(s => s.staff_id === a.staff_id);
            const user = staffRecord ? data.users.find(u => u.id === staffRecord.user_id) : null;
            return {
                ...a,
                name: user ? user.name : 'Unknown',
                role: user ? user.role : '',
                designation: staffRecord ? staffRecord.designation : ''
            };
        });
    },
    markAttendance: async (attendanceData) => {
        const data = readDB();
        
        // Check if entry already exists
        const existingIdx = data.attendance.findIndex(
            a => a.staff_id === attendanceData.staff_id && a.date === attendanceData.date
        );

        if (existingIdx !== -1) {
            data.attendance[existingIdx] = {
                ...data.attendance[existingIdx],
                ...attendanceData
            };
            writeDB(data);
            return data.attendance[existingIdx];
        } else {
            const newId = data.attendance.length > 0 ? Math.max(...data.attendance.map(a => a.attendance_id)) + 1 : 1;
            const newAttendance = {
                attendance_id: newId,
                ...attendanceData
            };
            data.attendance.push(newAttendance);
            writeDB(data);
            return newAttendance;
        }
    },

    // Classrooms
    getClassrooms: async () => {
        const data = readDB();
        return data.classrooms.map(c => {
            const teacherRecord = data.staff.find(s => s.staff_id === c.teacher_id);
            const teacherUser = teacherRecord ? data.users.find(u => u.id === teacherRecord.user_id) : null;

            const helperRecord = data.staff.find(s => s.staff_id === c.helper_id);
            const helperUser = helperRecord ? data.users.find(u => u.id === helperRecord.user_id) : null;

            return {
                ...c,
                teacherName: teacherUser ? teacherUser.name : 'Unassigned',
                helperName: helperUser ? helperUser.name : 'Unassigned'
            };
        });
    },
    createClassroom: async (classroom) => {
        const data = readDB();
        const newId = data.classrooms.length > 0 ? Math.max(...data.classrooms.map(c => c.classroom_id)) + 1 : 1;
        const newClass = { classroom_id: newId, ...classroom, status: classroom.status || 'Active' };
        data.classrooms.push(newClass);
        writeDB(data);
        return newClass;
    },
    assignStaffToClassroom: async (classroom_id, teacher_id, helper_id) => {
        const data = readDB();
        const classIdx = data.classrooms.findIndex(c => c.classroom_id === parseInt(classroom_id));
        if (classIdx === -1) return null;
        
        data.classrooms[classIdx].teacher_id = teacher_id || null;
        data.classrooms[classIdx].helper_id = helper_id || null;
        writeDB(data);
        return data.classrooms[classIdx];
    },

    // Roster
    getRoster: async (date) => {
        const data = readDB();
        let list = data.duty_roster;
        if (date) {
            list = list.filter(r => r.assigned_date === date);
        }
        return list.map(r => {
            const staffRecord = data.staff.find(s => s.staff_id === r.staff_id);
            const user = staffRecord ? data.users.find(u => u.id === staffRecord.user_id) : null;
            const classroom = data.classrooms.find(c => c.classroom_id === r.classroom_id);

            return {
                ...r,
                staff_name: user ? user.name : 'Unknown',
                role: user ? user.role : '',
                classroom_name: classroom ? classroom.classroom_name : 'Unknown'
            };
        });
    },
    saveRosterEntry: async (entry) => {
        const data = readDB();
        const existingIdx = data.duty_roster.findIndex(
            r => r.staff_id === entry.staff_id && r.assigned_date === entry.assigned_date
        );

        if (existingIdx !== -1) {
            data.duty_roster[existingIdx] = {
                ...data.duty_roster[existingIdx],
                ...entry
            };
            writeDB(data);
            return data.duty_roster[existingIdx];
        } else {
            const newId = data.duty_roster.length > 0 ? Math.max(...data.duty_roster.map(r => r.roster_id)) + 1 : 1;
            const newRoster = { roster_id: newId, ...entry };
            data.duty_roster.push(newRoster);
            writeDB(data);
            return newRoster;
        }
    },

    // Tasks
    getTasks: async (staff_id) => {
        const data = readDB();
        let list = data.tasks;
        if (staff_id) {
            list = list.filter(t => t.assigned_to === staff_id);
        }
        return list.map(t => {
            const staffRecord = data.staff.find(s => s.staff_id === t.assigned_to);
            const user = staffRecord ? data.users.find(u => u.id === staffRecord.user_id) : null;
            return {
                ...t,
                assigned_name: user ? user.name : 'Unknown'
            };
        });
    },
    createTask: async (task) => {
        const data = readDB();
        const newId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.task_id)) + 1 : 1;
        const newTask = { task_id: newId, ...task, status: task.status || 'Pending' };
        data.tasks.push(newTask);
        writeDB(data);
        return newTask;
    },
    updateTask: async (task_id, updateData) => {
        const data = readDB();
        const idx = data.tasks.findIndex(t => t.task_id === parseInt(task_id));
        if (idx === -1) return null;

        data.tasks[idx] = {
            ...data.tasks[idx],
            ...updateData
        };
        writeDB(data);
        return data.tasks[idx];
    },

    // Notifications
    getNotifications: async (user_id) => {
        const data = readDB();
        return data.notifications
            .filter(n => n.user_id === parseInt(user_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    createNotification: async (notification) => {
        const data = readDB();
        const newId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.notification_id)) + 1 : 1;
        const newNotif = {
            notification_id: newId,
            ...notification,
            created_at: new Date().toISOString(),
            is_read: false
        };
        data.notifications.push(newNotif);
        writeDB(data);
        return newNotif;
    },
    markNotificationRead: async (notification_id) => {
        const data = readDB();
        const idx = data.notifications.findIndex(n => n.notification_id === parseInt(notification_id));
        if (idx === -1) return false;
        data.notifications[idx].is_read = true;
        writeDB(data);
        return true;
    }
};

module.exports = db;
