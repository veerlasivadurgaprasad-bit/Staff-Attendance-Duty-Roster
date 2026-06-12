const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, rosterController.getRoster);
router.get('/suggestions', authMiddleware, rosterController.getShiftSuggestions);

// Mutating roster records requires Admin or Centre Head access
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), rosterController.createRosterEntry);
router.post('/auto-allocate', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), rosterController.autoAllocateRoster);

module.exports = router;
