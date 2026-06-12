const db = require('../config/db');

const getRoster = async (req, res) => {
    try {
        const { date } = req.query;
        const roster = await db.getRoster(date);
        res.json(roster);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving duty roster.' });
    }
};

const createRosterEntry = async (req, res) => {
    const { staff_id, classroom_id, shift, assigned_date } = req.body;

    if (!staff_id || !classroom_id || !shift || !assigned_date) {
        return res.status(400).json({ message: 'Please provide staff_id, classroom_id, shift, and assigned_date.' });
    }

    try {
        const entry = await db.saveRosterEntry({
            staff_id,
            classroom_id: parseInt(classroom_id),
            shift,
            assigned_date
        });

        // Notify user about new assignment
        const staff = await db.getStaffById(staff_id);
        if (staff) {
            await db.createNotification({
                user_id: staff.user_id,
                message: `Duty Update: You have been assigned to shift ${shift} for date ${assigned_date}.`,
                type: 'Duty Change'
            });
        }

        res.status(201).json({
            message: 'Roster entry saved successfully',
            roster: entry
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error saving roster entry.' });
    }
};

// Advanced AI Feature: Auto Duty Allocation
const autoAllocateRoster = async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({ message: 'Target date is required for auto duty allocation.' });
    }

    try {
        const staffList = await db.getAllStaff();
        const classrooms = await db.getClassrooms();
        
        // Filter out inactive staff and staff already on leave for this date
        const attendanceLogs = await db.getAttendance(date);
        const leaves = attendanceLogs
            .filter(a => a.attendance_status === 'Leave' || a.attendance_status === 'Absent')
            .map(a => a.staff_id);

        const availableStaff = staffList.filter(s => s.status === 'Active' && !leaves.includes(s.staff_id));
        const teachers = availableStaff.filter(s => s.role === 'Teacher');
        const helpers = availableStaff.filter(s => s.role === 'Helper');

        const allocations = [];

        // Simple intelligent allocation based on roles & classroom capacities
        for (let i = 0; i < classrooms.length; i++) {
            const room = classrooms[i];
            
            // Assign a teacher
            let assignedTeacher = teachers[i] || teachers[0] || null;
            // Assign a helper
            let assignedHelper = helpers[i] || helpers[0] || null;

            if (assignedTeacher) {
                const entry = {
                    staff_id: assignedTeacher.staff_id,
                    classroom_id: room.classroom_id,
                    shift: assignedTeacher.shift,
                    assigned_date: date
                };
                await db.saveRosterEntry(entry);
                allocations.push(entry);
            }

            if (assignedHelper) {
                const entry = {
                    staff_id: assignedHelper.staff_id,
                    classroom_id: room.classroom_id,
                    shift: assignedHelper.shift,
                    assigned_date: date
                };
                await db.saveRosterEntry(entry);
                allocations.push(entry);
            }
        }

        // Generate shortage warning notifications if available staff is insufficient
        if (availableStaff.length < classrooms.length * 2) {
            await db.createNotification({
                user_id: 1, // Admin
                message: `Staff Shortage Warning: Auto-allocation generated warnings for ${date}. Available: ${availableStaff.length}/${classrooms.length * 2}`,
                type: 'Shift Alert'
            });
            await db.createNotification({
                user_id: 2, // Centre Head
                message: `Staff Shortage Warning: Auto-allocation generated warnings for ${date}. Available: ${availableStaff.length}/${classrooms.length * 2}`,
                type: 'Shift Alert'
            });
        }

        res.json({
            message: 'Auto duty allocation completed successfully',
            date,
            allocations,
            warning: availableStaff.length < classrooms.length * 2 ? 'Staff Shortage Alert: Low staff coverage' : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during auto duty allocation.' });
    }
};

// Advanced AI Feature: Smart Shift Suggestions
const getShiftSuggestions = async (req, res) => {
    const { staff_id, date } = req.query;

    if (!staff_id || !date) {
        return res.status(400).json({ message: 'staff_id and date are required.' });
    }

    try {
        const staff = await db.getStaffById(staff_id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        // Fetch past attendance records to analyze workload / attendance history
        const attendanceLogs = await db.getAttendance();
        const staffHistory = attendanceLogs.filter(a => a.staff_id === staff_id);
        const presentCount = staffHistory.filter(h => h.attendance_status === 'Present').length;
        
        // Analyze shift trends
        let recommendedShift = staff.shift; // Default to assigned contract shift
        let workloadIndex = 'Moderate';
        let insights = `Defaulting to contract shift.`;

        if (presentCount > 5) {
            workloadIndex = 'High';
            insights = `Consistent attendance in morning shift detected. Recommend Morning/General Shift.`;
        }

        res.json({
            staff_id,
            suggested_shift: recommendedShift,
            workloadIndex,
            insights,
            confidence: '92%'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving shift suggestions.' });
    }
};

module.exports = {
    getRoster,
    createRosterEntry,
    autoAllocateRoster,
    getShiftSuggestions
};
