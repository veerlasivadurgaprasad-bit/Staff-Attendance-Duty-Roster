// Client-side LocalStorage DB Simulation
// Initializes data if absent, handles local edits so changes persist instantly on refresh.

const LOCAL_STORAGE_KEY = 'firstcry_intellitots_db';

const getInitialDB = () => {
  return {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@firstcry.com', role: 'Admin' },
      { id: 2, name: 'Priya Sharma', email: 'priya.sharma@firstcry.com', role: 'Centre Head' },
      { id: 3, name: 'Ananya Sen', email: 'ananya.sen@firstcry.com', role: 'Teacher' },
      { id: 4, name: 'Meera Nair', email: 'meera.nair@firstcry.com', role: 'Teacher' },
      { id: 5, name: 'Sita Devi', email: 'sita.devi@firstcry.com', role: 'Helper' },
      { id: 6, name: 'Rani Mukherji', email: 'rani.m@firstcry.com', role: 'Helper' }
    ],
    staff: [
      { staff_id: 'T-001', user_id: 3, name: 'Ananya Sen', email: 'ananya.sen@firstcry.com', role: 'Teacher', designation: 'Toddler Lead Teacher', department: 'Early Years', phone: '9876543210', shift: 'Morning Shift (08:00 AM - 02:00 PM)', status: 'Active' },
      { staff_id: 'T-002', user_id: 4, name: 'Meera Nair', email: 'meera.nair@firstcry.com', role: 'Teacher', designation: 'Preschool Teacher', department: 'Preschool', phone: '9876543211', shift: 'General Shift (09:00 AM - 05:00 PM)', status: 'Active' },
      { staff_id: 'H-001', user_id: 5, name: 'Sita Devi', email: 'sita.devi@firstcry.com', role: 'Helper', designation: 'Classroom Attendant', department: 'Daycare Support', phone: '9876543212', shift: 'Morning Shift (08:00 AM - 02:00 PM)', status: 'Active' },
      { staff_id: 'H-002', user_id: 6, name: 'Rani Mukherji', email: 'rani.m@firstcry.com', role: 'Helper', designation: 'Daycare Helper', department: 'Daycare Support', phone: '9876543213', shift: 'Daycare Shift (10:00 AM - 07:00 PM)', status: 'Active' }
    ],
    classrooms: [
      { classroom_id: 1, classroom_name: 'Playgroup - Nestling', teacher_id: 'T-001', teacherName: 'Ananya Sen', helper_id: 'H-001', helperName: 'Sita Devi', capacity: 12, status: 'Active' },
      { classroom_id: 2, classroom_name: 'Nursery - Fledglings', teacher_id: 'T-002', teacherName: 'Meera Nair', helper_id: 'H-002', helperName: 'Rani Mukherji', capacity: 15, status: 'Active' },
      { classroom_id: 3, classroom_name: 'Daycare - Cozy Cabin', teacher_id: null, teacherName: 'Unassigned', helper_id: null, helperName: 'Unassigned', capacity: 20, status: 'Active' }
    ],
    attendance: [
      { attendance_id: 1, staff_id: 'T-001', name: 'Ananya Sen', role: 'Teacher', designation: 'Toddler Lead Teacher', date: '2026-06-11', check_in: '07:55:00', check_out: '14:05:00', attendance_status: 'Present' },
      { attendance_id: 2, staff_id: 'T-002', name: 'Meera Nair', role: 'Teacher', designation: 'Preschool Teacher', date: '2026-06-11', check_in: '08:58:00', check_out: '17:02:00', attendance_status: 'Present' },
      { attendance_id: 3, staff_id: 'H-001', name: 'Sita Devi', role: 'Helper', designation: 'Classroom Attendant', date: '2026-06-11', check_in: '08:10:00', check_out: '14:00:00', attendance_status: 'Present' },
      { attendance_id: 4, staff_id: 'H-002', name: 'Rani Mukherji', role: 'Helper', designation: 'Daycare Helper', date: '2026-06-11', check_in: null, check_out: null, attendance_status: 'Absent' },
      { attendance_id: 5, staff_id: 'T-001', name: 'Ananya Sen', role: 'Teacher', designation: 'Toddler Lead Teacher', date: '2026-06-12', check_in: '07:52:00', check_out: null, attendance_status: 'Present' },
      { attendance_id: 6, staff_id: 'T-002', name: 'Meera Nair', role: 'Teacher', designation: 'Preschool Teacher', date: '2026-06-12', check_in: '09:05:00', check_out: null, attendance_status: 'Present' },
      { attendance_id: 7, staff_id: 'H-001', name: 'Sita Devi', role: 'Helper', designation: 'Classroom Attendant', date: '2026-06-12', check_in: null, check_out: null, attendance_status: 'Leave' }
    ],
    duty_roster: [
      { roster_id: 1, staff_id: 'T-001', staff_name: 'Ananya Sen', role: 'Teacher', classroom_id: 1, classroom_name: 'Playgroup - Nestling', shift: 'Morning Shift (08:00 AM - 02:00 PM)', assigned_date: '2026-06-12' },
      { roster_id: 2, staff_id: 'T-002', staff_name: 'Meera Nair', role: 'Teacher', classroom_id: 2, classroom_name: 'Nursery - Fledglings', shift: 'General Shift (09:00 AM - 05:00 PM)', assigned_date: '2026-06-12' },
      { roster_id: 3, staff_id: 'H-001', staff_name: 'Sita Devi', role: 'Helper', classroom_id: 1, classroom_name: 'Playgroup - Nestling', shift: 'Morning Shift (08:00 AM - 02:00 PM)', assigned_date: '2026-06-12' },
      { roster_id: 4, staff_id: 'H-002', staff_name: 'Rani Mukherji', role: 'Helper', classroom_id: 3, classroom_name: 'Daycare - Cozy Cabin', shift: 'Daycare Shift (10:00 AM - 07:00 PM)', assigned_date: '2026-06-12' }
    ],
    tasks: [
      { task_id: 1, assigned_to: 'T-001', assigned_name: 'Ananya Sen', title: 'Sanitize Learning Material', description: 'Disinfect all wooden blocks and sensory play materials in the Nursery classroom.', priority: 'High', due_date: '2026-06-12', status: 'Pending' },
      { task_id: 2, assigned_to: 'T-002', assigned_name: 'Meera Nair', title: 'Prepare Weekly Lesson Plan', description: 'Upload lesson plan for Next Week theme (Animals & Habitats).', priority: 'Medium', due_date: '2026-06-14', status: 'In Progress' },
      { task_id: 3, assigned_to: 'H-002', assigned_name: 'Rani Mukherji', title: 'Mid-day Meal Service Prep', description: 'Arrange high chairs and assist in feeding the Toddler group with milk & fruit puree.', priority: 'High', due_date: '2026-06-12', status: 'Pending' }
    ],
    notifications: [
      { notification_id: 1, user_id: 3, message: 'Welcome! You have been assigned to Playgroup - Nestling for the morning shift today.', type: 'Duty Change', created_at: new Date().toISOString(), is_read: false },
      { notification_id: 2, user_id: 5, message: 'Your leave request for June 12, 2026, has been approved by the Centre Head.', type: 'Attendance', created_at: new Date().toISOString(), is_read: false },
      { notification_id: 3, user_id: 1, message: 'Staff shortage warning: Helper H-001 is on leave. High priority tasks reassigned.', type: 'Shift Alert', created_at: new Date().toISOString(), is_read: false }
    ]
  };
};

export const readMockDB = () => {
  const dbStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!dbStr) {
    const fresh = getInitialDB();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return JSON.parse(dbStr);
};

export const writeMockDB = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

// Simulated APIs matching Backend Controllers
export const mockAPI = {
  login: async (email, password, role) => {
    const db = readMockDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (!user) {
      throw new Error('Invalid email, password, or role.');
    }
    const staff = db.staff.find(s => s.user_id === user.id);
    return {
      token: `mock_jwt_token_${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        staff_id: staff ? staff.staff_id : null
      }
    };
  },

  // Staff
  getStaff: async (filters = {}) => {
    const db = readMockDB();
    let list = db.staff;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(term) || s.staff_id.toLowerCase().includes(term) || s.designation.toLowerCase().includes(term));
    }
    if (filters.role) list = list.filter(s => s.role === filters.role);
    if (filters.status) list = list.filter(s => s.status === filters.status);
    return list;
  },
  createStaff: async (staffData) => {
    const db = readMockDB();
    
    // Check constraints
    if (db.staff.some(s => s.staff_id === staffData.staff_id)) throw new Error('Staff ID exists.');
    if (db.users.some(u => u.email.toLowerCase() === staffData.email.toLowerCase())) throw new Error('Email already registered.');

    const newUserId = Math.max(...db.users.map(u => u.id), 0) + 1;
    const newUser = { id: newUserId, name: staffData.name, email: staffData.email, role: staffData.role };
    db.users.push(newUser);

    const record = {
      staff_id: staffData.staff_id,
      user_id: newUserId,
      name: staffData.name,
      email: staffData.email,
      role: staffData.role,
      designation: staffData.designation,
      department: staffData.department,
      phone: staffData.phone,
      shift: staffData.shift,
      status: staffData.status || 'Active'
    };
    db.staff.push(record);
    writeMockDB(db);
    return record;
  },
  updateStaff: async (staff_id, updates) => {
    const db = readMockDB();
    const idx = db.staff.findIndex(s => s.staff_id === staff_id);
    if (idx === -1) throw new Error('Staff not found.');

    const record = { ...db.staff[idx], ...updates };
    db.staff[idx] = record;

    // Update corresponding user record
    const userIdx = db.users.findIndex(u => u.id === record.user_id);
    if (userIdx !== -1) {
      if (updates.name) db.users[userIdx].name = updates.name;
      if (updates.email) db.users[userIdx].email = updates.email;
      if (updates.role) db.users[userIdx].role = updates.role;
    }

    writeMockDB(db);
    return record;
  },
  deleteStaff: async (staff_id) => {
    const db = readMockDB();
    const staff = db.staff.find(s => s.staff_id === staff_id);
    if (!staff) throw new Error('Staff not found.');

    db.staff = db.staff.filter(s => s.staff_id !== staff_id);
    db.users = db.users.filter(u => u.id !== staff.user_id);
    writeMockDB(db);
    return true;
  },

  // Attendance
  getAttendance: async (filters = {}) => {
    const db = readMockDB();
    let list = db.attendance;
    if (filters.date) list = list.filter(a => a.date === filters.date);
    if (filters.staff_id) list = list.filter(a => a.staff_id === filters.staff_id);
    return list;
  },
  markAttendance: async (entry) => {
    const db = readMockDB();
    const staff = db.staff.find(s => s.staff_id === entry.staff_id);
    const staffName = staff ? staff.name : 'Unknown';

    const existingIdx = db.attendance.findIndex(a => a.staff_id === entry.staff_id && a.date === entry.date);
    
    const record = {
      staff_id: entry.staff_id,
      name: staffName,
      role: staff ? staff.role : 'Teacher',
      designation: staff ? staff.designation : '',
      date: entry.date,
      check_in: entry.check_in || null,
      check_out: entry.check_out || null,
      attendance_status: entry.attendance_status
    };

    if (existingIdx !== -1) {
      db.attendance[existingIdx] = { ...db.attendance[existingIdx], ...record };
    } else {
      const newId = Math.max(...db.attendance.map(a => a.attendance_id), 0) + 1;
      db.attendance.push({ attendance_id: newId, ...record });
    }

    // Shortage Notification if absent
    if (entry.attendance_status === 'Absent' || entry.attendance_status === 'Leave') {
      db.notifications.push({
        notification_id: Math.max(...db.notifications.map(n => n.notification_id), 0) + 1,
        user_id: 1, // Notify Admin
        message: `Attendance Alert: ${staffName} (${entry.staff_id}) marked as ${entry.attendance_status} today.`,
        type: 'Attendance',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    writeMockDB(db);
    return record;
  },

  // Classrooms
  getClassrooms: async () => {
    const db = readMockDB();
    return db.classrooms.map(c => {
      const teacher = db.staff.find(s => s.staff_id === c.teacher_id);
      const helper = db.staff.find(s => s.staff_id === c.helper_id);
      return {
        ...c,
        teacherName: teacher ? teacher.name : 'Unassigned',
        helperName: helper ? helper.name : 'Unassigned'
      };
    });
  },
  createClassroom: async (classroom) => {
    const db = readMockDB();
    const newId = Math.max(...db.classrooms.map(c => c.classroom_id), 0) + 1;
    const newClass = {
      classroom_id: newId,
      ...classroom,
      teacherName: 'Unassigned',
      helperName: 'Unassigned',
      status: 'Active'
    };
    db.classrooms.push(newClass);
    writeMockDB(db);
    return newClass;
  },
  assignClassroomStaff: async (classroom_id, teacher_id, helper_id) => {
    const db = readMockDB();
    const idx = db.classrooms.findIndex(c => c.classroom_id === parseInt(classroom_id));
    if (idx === -1) throw new Error('Classroom not found.');

    const teacher = db.staff.find(s => s.staff_id === teacher_id);
    const helper = db.staff.find(s => s.staff_id === helper_id);

    db.classrooms[idx].teacher_id = teacher_id || null;
    db.classrooms[idx].teacherName = teacher ? teacher.name : 'Unassigned';
    db.classrooms[idx].helper_id = helper_id || null;
    db.classrooms[idx].helperName = helper ? helper.name : 'Unassigned';

    writeMockDB(db);
    return db.classrooms[idx];
  },

  // Roster
  getRoster: async (filters = {}) => {
    const db = readMockDB();
    let list = db.duty_roster;
    if (filters.date) list = list.filter(r => r.assigned_date === filters.date);
    return list.map(r => {
      const staff = db.staff.find(s => s.staff_id === r.staff_id);
      const room = db.classrooms.find(c => c.classroom_id === r.classroom_id);
      return {
        ...r,
        staff_name: staff ? staff.name : 'Unknown',
        role: staff ? staff.role : 'Teacher',
        classroom_name: room ? room.classroom_name : 'Unknown'
      };
    });
  },
  saveRoster: async (entry) => {
    const db = readMockDB();
    const staff = db.staff.find(s => s.staff_id === entry.staff_id);
    const room = db.classrooms.find(c => c.classroom_id === parseInt(entry.classroom_id));

    const existingIdx = db.duty_roster.findIndex(
      r => r.staff_id === entry.staff_id && r.assigned_date === entry.assigned_date
    );

    const record = {
      staff_id: entry.staff_id,
      staff_name: staff ? staff.name : 'Unknown',
      role: staff ? staff.role : 'Teacher',
      classroom_id: parseInt(entry.classroom_id),
      classroom_name: room ? room.classroom_name : 'Unknown',
      shift: entry.shift,
      assigned_date: entry.assigned_date
    };

    if (existingIdx !== -1) {
      db.duty_roster[existingIdx] = { ...db.duty_roster[existingIdx], ...record };
    } else {
      const newId = Math.max(...db.duty_roster.map(r => r.roster_id), 0) + 1;
      db.duty_roster.push({ roster_id: newId, ...record });
    }

    if (staff) {
      db.notifications.push({
        notification_id: Math.max(...db.notifications.map(n => n.notification_id), 0) + 1,
        user_id: staff.user_id,
        message: `Duty assigned: Classroom "${room ? room.classroom_name : ''}" for ${entry.assigned_date} (${entry.shift})`,
        type: 'Duty Change',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    writeMockDB(db);
    return record;
  },

  // Auto Duty Allocation AI Feature
  autoAllocate: async (date) => {
    const db = readMockDB();
    const attendanceLogs = db.attendance.filter(a => a.date === date);
    const leaves = attendanceLogs
      .filter(a => a.attendance_status === 'Leave' || a.attendance_status === 'Absent')
      .map(a => a.staff_id);

    const availableStaff = db.staff.filter(s => s.status === 'Active' && !leaves.includes(s.staff_id));
    const teachers = availableStaff.filter(s => s.role === 'Teacher');
    const helpers = availableStaff.filter(s => s.role === 'Helper');

    const allocations = [];

    db.classrooms.forEach((room, idx) => {
      const teacher = teachers[idx] || teachers[0];
      const helper = helpers[idx] || helpers[0];

      if (teacher) {
        allocations.push({
          staff_id: teacher.staff_id,
          staff_name: teacher.name,
          role: 'Teacher',
          classroom_id: room.classroom_id,
          classroom_name: room.classroom_name,
          shift: teacher.shift,
          assigned_date: date
        });
      }
      if (helper) {
        allocations.push({
          staff_id: helper.staff_id,
          staff_name: helper.name,
          role: 'Helper',
          classroom_id: room.classroom_id,
          classroom_name: room.classroom_name,
          shift: helper.shift,
          assigned_date: date
        });
      }
    });

    // Overwrite duty roster for this day
    db.duty_roster = db.duty_roster.filter(r => r.assigned_date !== date);
    db.duty_roster.push(...allocations);

    // Shortage checks
    if (availableStaff.length < db.classrooms.length * 2) {
      db.notifications.push({
        notification_id: Math.max(...db.notifications.map(n => n.notification_id), 0) + 1,
        user_id: 1, // Admin
        message: `Shortage alert on ${date}: Auto allocation completed with warnings. Checked classrooms: ${db.classrooms.length}. Available staff: ${availableStaff.length}.`,
        type: 'Shift Alert',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    writeMockDB(db);
    return allocations;
  },

  // Tasks
  getTasks: async (assigned_to = null) => {
    const db = readMockDB();
    let list = db.tasks;
    if (assigned_to) list = list.filter(t => t.assigned_to === assigned_to);
    return list;
  },
  createTask: async (task) => {
    const db = readMockDB();
    const staff = db.staff.find(s => s.staff_id === task.assigned_to);
    const newId = Math.max(...db.tasks.map(t => t.task_id), 0) + 1;
    
    const record = {
      task_id: newId,
      assigned_to: task.assigned_to,
      assigned_name: staff ? staff.name : 'Unknown',
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      due_date: task.due_date,
      status: 'Pending'
    };

    db.tasks.push(record);

    if (staff) {
      db.notifications.push({
        notification_id: Math.max(...db.notifications.map(n => n.notification_id), 0) + 1,
        user_id: staff.user_id,
        message: `New Task Assigned: "${task.title}". Due date: ${task.due_date}.`,
        type: 'Announcement',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    writeMockDB(db);
    return record;
  },
  updateTask: async (task_id, updates) => {
    const db = readMockDB();
    const idx = db.tasks.findIndex(t => t.task_id === parseInt(task_id));
    if (idx === -1) throw new Error('Task not found.');

    db.tasks[idx] = { ...db.tasks[idx], ...updates };

    if (updates.status === 'Completed') {
      const t = db.tasks[idx];
      db.notifications.push({
        notification_id: Math.max(...db.notifications.map(n => n.notification_id), 0) + 1,
        user_id: 1, // Admin
        message: `Task Completed: ${t.assigned_name} completed task "${t.title}".`,
        type: 'Announcement',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    writeMockDB(db);
    return db.tasks[idx];
  },

  // Notifications
  getNotifications: async (user_id) => {
    const db = readMockDB();
    return db.notifications
      .filter(n => n.user_id === parseInt(user_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  markNotificationRead: async (notification_id) => {
    const db = readMockDB();
    const idx = db.notifications.findIndex(n => n.notification_id === parseInt(notification_id));
    if (idx !== -1) {
      db.notifications[idx].is_read = true;
      writeMockDB(db);
    }
    return true;
  },

  // Dashboard Statistics
  getStats: async () => {
    const db = readMockDB();
    const today = new Date().toISOString().split('T')[0];

    const totalStaff = db.staff.length;
    const attendanceToday = db.attendance.filter(a => a.date === today);

    const presentToday = attendanceToday.filter(a => a.attendance_status === 'Present' || a.attendance_status === 'Half Day').length;
    const absentToday = attendanceToday.filter(a => a.attendance_status === 'Absent').length;
    const leaveToday = attendanceToday.filter(a => a.attendance_status === 'Leave').length;

    const rostersToday = db.duty_roster.filter(r => r.assigned_date === today);
    const teachersOnDuty = rostersToday.filter(r => r.role === 'Teacher').length;
    const helpersOnDuty = rostersToday.filter(r => r.role === 'Helper').length;

    const pendingTasks = db.tasks.filter(t => t.status !== 'Completed').length;
    const attendancePercentage = attendanceToday.length > 0
      ? Math.round((presentToday / attendanceToday.length) * 100)
      : 100;

    // Charts
    const weeklyAttendance = [
      { day: 'Mon', rate: 90 },
      { day: 'Tue', rate: 93 },
      { day: 'Wed', rate: 87 },
      { day: 'Thu', rate: 92 },
      { day: 'Fri', rate: attendancePercentage }
    ];

    const monthlyAttendance = [
      { month: 'Jan', rate: 95 },
      { month: 'Feb', rate: 91 },
      { month: 'Mar', rate: 94 },
      { month: 'Apr', rate: 92 },
      { month: 'May', rate: 93 }
    ];

    const staffPerformance = db.staff.map(s => {
      const staffTasks = db.tasks.filter(t => t.assigned_to === s.staff_id);
      const completed = staffTasks.filter(t => t.status === 'Completed').length;
      const rate = staffTasks.length > 0 ? Math.round((completed / staffTasks.length) * 100) : 100;
      return { name: s.name, role: s.role, performanceScore: rate };
    }).slice(0, 5);

    // AI Shortages
    const activeRooms = db.classrooms.filter(c => c.status === 'Active');
    const shortageAlerts = [];
    activeRooms.forEach(c => {
      const hasTeacher = rostersToday.some(r => r.classroom_id === c.classroom_id && r.role === 'Teacher');
      const hasHelper = rostersToday.some(r => r.classroom_id === c.classroom_id && r.role === 'Helper');
      if (!hasTeacher) shortageAlerts.push(`Staff Shortage: No teacher assigned to room "${c.classroom_name}" today.`);
      if (!hasHelper) shortageAlerts.push(`Staff Shortage: No helper assigned to room "${c.classroom_name}" today.`);
    });

    let attendanceTrendAnalysis = "Attendance logs are stable. Daily classroom operations meeting 90%+ goals.";
    if (leaveToday >= 2) {
      attendanceTrendAnalysis = "Spike in leaves detected. Suggesting cross-room adjustments or reducing active capacities.";
    }

    const lowPerformers = staffPerformance.filter(p => p.performanceScore < 70);
    let performanceInsights = "All staff meeting completion targets. Daycare activities proceeding on schedule.";
    if (lowPerformers.length > 0) {
      performanceInsights = `Workload Warning: ${lowPerformers.map(p => p.name).join(', ')} have overdue checklist activities. Recommend task delegating.`;
    }

    return {
      kpis: {
        totalStaff,
        presentToday,
        absentToday,
        leaveToday,
        teachersOnDuty,
        helpersOnDuty,
        pendingTasks,
        attendancePercentage
      },
      charts: {
        weeklyAttendance,
        monthlyAttendance,
        staffPerformance
      },
      aiInsights: {
        shortageAlerts,
        attendanceTrendAnalysis,
        performanceInsights
      }
    };
  }
};
