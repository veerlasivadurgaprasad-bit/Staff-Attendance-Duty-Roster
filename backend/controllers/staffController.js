const db = require('../config/db');

const getStaff = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        let staffList = await db.getAllStaff();

        if (search) {
            const term = search.toLowerCase();
            staffList = staffList.filter(s => 
                s.name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term) ||
                s.staff_id.toLowerCase().includes(term) ||
                s.phone.includes(term) ||
                s.designation.toLowerCase().includes(term) ||
                (s.department && s.department.toLowerCase().includes(term))
            );
        }

        if (role) {
            staffList = staffList.filter(s => s.role === role);
        }

        if (status) {
            staffList = staffList.filter(s => s.status === status);
        }

        res.json(staffList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving staff records.' });
    }
};

const getStaffMember = async (req, res) => {
    try {
        const staff = await db.getStaffById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving staff member.' });
    }
};

const createStaff = async (req, res) => {
    const { staff_id, name, email, role, designation, department, phone, shift, status, password } = req.body;

    if (!staff_id || !name || !email || !role || !designation || !department || !phone || !shift) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if staff ID or email is already in use
        const existingStaff = await db.getStaffById(staff_id);
        if (existingStaff) {
            return res.status(400).json({ message: 'Staff ID is already registered.' });
        }

        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email address is already in use.' });
        }

        const newStaff = await db.createStaff(
            { staff_id, designation, department, phone, shift, status },
            { name, email, role, password }
        );

        res.status(201).json({
            message: 'Staff member created successfully',
            staff: newStaff
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating staff member.' });
    }
};

const updateStaff = async (req, res) => {
    try {
        const updatedStaff = await db.updateStaff(req.params.id, req.body);
        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }
        res.json({
            message: 'Staff member updated successfully',
            staff: updatedStaff
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating staff member.' });
    }
};

const deleteStaff = async (req, res) => {
    try {
        const success = await db.deleteStaff(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }
        res.json({ message: 'Staff member deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting staff member.' });
    }
};

module.exports = {
    getStaff,
    getStaffMember,
    createStaff,
    updateStaff,
    deleteStaff
};
