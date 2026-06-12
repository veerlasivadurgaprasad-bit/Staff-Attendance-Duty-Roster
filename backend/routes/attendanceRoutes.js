const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, attendanceController.getAttendance);
router.get('/report', authMiddleware, attendanceController.getAttendanceReport);

// Only Admin, Centre Head, or Teachers (for self/helpers) can log attendance
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Centre Head', 'Teacher']), attendanceController.markAttendance);

module.exports = router;
