const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all staff (Any authenticated user can view staff list)
router.get('/', authMiddleware, staffController.getStaff);
router.get('/:id', authMiddleware, staffController.getStaffMember);

// Modify staff (Admin & Centre Head only)
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), staffController.createStaff);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), staffController.updateStaff);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), staffController.deleteStaff);

module.exports = router;
