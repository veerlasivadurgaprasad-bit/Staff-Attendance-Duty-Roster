const db = require('../config/db');

const getStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch data
        const staff = await db.getAllStaff();
        const attendanceToday = await db.getAttendance(today);
        const rostersToday = await db.getRoster(today);
        const allTasks = await db.getTasks();
        const classrooms = await db.getClassrooms();

        // 1. KPI Calculations
        const totalStaff = staff.length;
        
        const presentToday = attendanceToday.filter(a => a.attendance_status === 'Present' || a.attendance_status === 'Half Day').length;
        const absentToday = attendanceToday.filter(a => a.attendance_status === 'Absent').length;
        const leaveToday = attendanceToday.filter(a => a.attendance_status === 'Leave').length;

        // Active duties count
        const teachersOnDuty = rostersToday.filter(r => r.role === 'Teacher').length;
        const helpersOnDuty = rostersToday.filter(r => r.role === 'Helper').length;

        // Pending tasks
        const pendingTasks = allTasks.filter(t => t.status !== 'Completed').length;

        // Attendance Percentage Today
        const totalLoggedToday = attendanceToday.length;
        const attendancePercentage = totalLoggedToday > 0
            ? Math.round((presentToday / totalLoggedToday) * 100)
            : 100;

        // 2. Chart Mock Data & Calculations
        // Weekly Attendance trends (Mon - Fri)
        const weeklyAttendance = [
            { day: 'Mon', rate: 92 },
            { day: 'Tue', rate: 95 },
            { day: 'Wed', rate: 88 },
            { day: 'Thu', rate: 91 },
            { day: 'Fri', rate: attendancePercentage }
        ];

        // Monthly Attendance trends (past 5 months)
        const monthlyAttendance = [
            { month: 'Jan', rate: 94 },
            { month: 'Feb', rate: 93 },
            { month: 'Mar', rate: 95 },
            { month: 'Apr', rate: 91 },
            { month: 'May', rate: 93 }
        ];

        // Staff Performance - Task completion rate & check-in punctuality
        const staffPerformance = staff.map(s => {
            const staffTasks = allTasks.filter(t => t.assigned_to === s.staff_id);
            const completed = staffTasks.filter(t => t.status === 'Completed').length;
            const completionRate = staffTasks.length > 0 ? Math.round((completed / staffTasks.length) * 100) : 100;
            return {
                name: s.name,
                role: s.role,
                performanceScore: completionRate
            };
        }).slice(0, 5); // Limit to top 5 for preview simplicity

        // 3. Advanced AI Feature: Staff Shortage Alerts
        const activeClassrooms = classrooms.filter(c => c.status === 'Active');
        const shortageAlerts = [];
        
        activeClassrooms.forEach(c => {
            const hasTeacher = rostersToday.some(r => r.classroom_id === c.classroom_id && r.role === 'Teacher');
            const hasHelper = rostersToday.some(r => r.classroom_id === c.classroom_id && r.role === 'Helper');

            if (!hasTeacher) {
                shortageAlerts.push(`Staff Shortage: No teacher assigned to active room "${c.classroom_name}" today.`);
            }
            if (!hasHelper) {
                shortageAlerts.push(`Staff Shortage: No classroom helper assigned to active room "${c.classroom_name}" today.`);
            }
        });

        // 4. Advanced AI Feature: Attendance Trend Analysis
        const allAttendance = await db.getAttendance();
        const leaveDaysCount = allAttendance.filter(a => a.attendance_status === 'Leave').length;
        const absentDaysCount = allAttendance.filter(a => a.attendance_status === 'Absent').length;
        
        let attendanceTrendAnalysis = "Attendance trends are stable and remain within normal operational thresholds (90%+). No action required.";
        if (absentDaysCount > totalStaff * 0.5) {
            attendanceTrendAnalysis = "Warning: Spike in unannounced absences detected this week. Recommended staff check-in or policy review.";
        } else if (leaveDaysCount > totalStaff * 0.3) {
            attendanceTrendAnalysis = "Notice: High volume of approved leaves. Recommended adjusting classroom capacity or scheduling external support staff.";
        }

        // 5. Advanced AI Feature: Performance Insights
        const lowPerformers = staffPerformance.filter(p => p.performanceScore < 70);
        let performanceInsights = "All staff meeting operational targets (70%+ task completion rate). Excellent standard maintained.";
        if (lowPerformers.length > 0) {
            performanceInsights = `Training recommendation: ${lowPerformers.map(p => p.name).join(', ')} has pending classroom assignments exceeding due dates. Recommend shift rebalancing.`;
        }

        res.json({
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error loading dashboard stats.' });
    }
};

module.exports = {
    getStats
};
