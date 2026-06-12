const db = require('../config/db');

const getTasks = async (req, res) => {
    try {
        const { assigned_to } = req.query;
        const tasks = await db.getTasks(assigned_to);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving tasks.' });
    }
};

const createTask = async (req, res) => {
    const { assigned_to, title, description, priority, due_date } = req.body;

    if (!assigned_to || !title || !due_date) {
        return res.status(400).json({ message: 'Please provide assigned_to, title, and due_date.' });
    }

    try {
        const task = await db.createTask({
            assigned_to,
            title,
            description: description || '',
            priority: priority || 'Medium',
            due_date,
            status: 'Pending'
        });

        // Notify the assigned staff member
        const staff = await db.getStaffById(assigned_to);
        if (staff) {
            await db.createNotification({
                user_id: staff.user_id,
                message: `New Task Assigned: "${title}". Due Date: ${due_date}.`,
                type: 'Announcement'
            });
        }

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating task.' });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await db.updateTask(req.params.id, req.body);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Send updates if status changes to Completed
        if (req.body.status === 'Completed') {
            const staff = await db.getStaffById(task.assigned_to);
            const staffName = staff ? staff.name : 'Staff';
            
            // Notify Admin and Centre Head
            await db.createNotification({
                user_id: 1, // Admin
                message: `Task Completed: ${staffName} completed task "${task.title}".`,
                type: 'Announcement'
            });
            await db.createNotification({
                user_id: 2, // Centre Head
                message: `Task Completed: ${staffName} completed task "${task.title}".`,
                type: 'Announcement'
            });
        }

        res.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating task.' });
    }
};

// Advanced AI Feature: Teacher Workload Analysis
const getWorkloadAnalysis = async (req, res) => {
    try {
        const staffList = await db.getAllStaff();
        const teachers = staffList.filter(s => s.role === 'Teacher');
        const allTasks = await db.getTasks();

        const analysis = teachers.map(teacher => {
            const teacherTasks = allTasks.filter(t => t.assigned_to === teacher.staff_id);
            const pendingTasks = teacherTasks.filter(t => t.status !== 'Completed');
            
            // Calculate workload score
            let score = 0;
            let status = 'Optimal';
            
            pendingTasks.forEach(t => {
                if (t.priority === 'High') score += 3;
                else if (t.priority === 'Medium') score += 2;
                else score += 1;
            });

            if (score >= 8) {
                status = 'Overloaded';
            } else if (score >= 5) {
                status = 'High';
            } else if (score > 0) {
                status = 'Moderate';
            }

            return {
                staff_id: teacher.staff_id,
                name: teacher.name,
                designation: teacher.designation,
                totalPendingTasks: pendingTasks.length,
                workloadScore: score,
                status,
                recommendation: status === 'Overloaded' 
                    ? 'De-escalate duties. Reassign high priority tasks to helpers or other teachers.'
                    : 'Workload is within acceptable threshold. OK to assign new tasks.'
            };
        });

        res.json(analysis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error analyzing teacher workload.' });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    getWorkloadAnalysis
};
