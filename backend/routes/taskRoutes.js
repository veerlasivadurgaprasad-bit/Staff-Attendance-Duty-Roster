const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, taskController.getTasks);
router.get('/workload', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), taskController.getWorkloadAnalysis);

// Mutating tasks
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Centre Head']), taskController.createTask);
router.put('/:id', authMiddleware, taskController.updateTask);

module.exports = router;
