const db = require('../config/db');

const markAttendance = async (req, res) => {
    const { staff_id, date, check_in, check_out, attendance_status } = req.body;

    if (!staff_id || !date || !attendance_status) {
        return res.status(400).json({ message: 'Staff ID, date, and status are required.' });
    }

    try {
        const record = await db.markAttendance({
            staff_id,
            date,
            check_in: check_in || null,
            check_out: check_out || null,
            attendance_status
        });

        // Trigger alert for absent staff
        if (attendance_status === 'Absent' || attendance_status === 'Leave') {
            // Find admin/centre head users to send notifications
            const allStaff = await db.getAllStaff();
            const matchingStaff = allStaff.find(s => s.staff_id === staff_id);
            const staffName = matchingStaff ? matchingStaff.name : staff_id;

            // Notify Admin (user ID 1) and Centre Head (user ID 2)
            await db.createNotification({
                user_id: 1,
                message: `Staff Alert: ${staffName} (${staff_id}) marked as ${attendance_status} on ${date}.`,
                type: 'Attendance'
            });
            await db.createNotification({
                user_id: 2,
                message: `Staff Alert: ${staffName} (${staff_id}) marked as ${attendance_status} on ${date}.`,
                type: 'Attendance'
            });
        }

        res.status(201).json({
            message: 'Attendance saved successfully',
            attendance: record
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error saving attendance record.' });
    }
};

const getAttendance = async (req, res) => {
    try {
        const { date, staff_id } = req.query;
        let records = await db.getAttendance(date);

        if (staff_id) {
            records = records.filter(r => r.staff_id === staff_id);
        }

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving attendance records.' });
    }
};

const getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, staff_id } = req.query;
        let records = await db.getAttendance();

        if (startDate) {
            records = records.filter(r => r.date >= startDate);
        }
        if (endDate) {
            records = records.filter(r => r.date <= endDate);
        }
        if (staff_id) {
            records = records.filter(r => r.staff_id === staff_id);
        }

        // Calculate statistics
        const totalRecords = records.length;
        const presentCount = records.filter(r => r.attendance_status === 'Present').length;
        const halfDayCount = records.filter(r => r.attendance_status === 'Half Day').length;
        const absentCount = records.filter(r => r.attendance_status === 'Absent').length;
        const leaveCount = records.filter(r => r.attendance_status === 'Leave').length;

        const attendanceRate = totalRecords > 0 
            ? (((presentCount + (halfDayCount * 0.5)) / totalRecords) * 100).toFixed(1)
            : 100.0;

        res.json({
            records,
            summary: {
                totalDays: totalRecords,
                present: presentCount,
                halfDay: halfDayCount,
                absent: absentCount,
                leave: leaveCount,
                attendanceRate: parseFloat(attendanceRate)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating attendance report.' });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    getAttendanceReport
};
