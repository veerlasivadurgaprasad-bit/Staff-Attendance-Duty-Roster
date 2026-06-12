const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'firstcry_intellitots_secret_key_2026';

const login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Please provide email, password, and role.' });
    }

    try {
        const user = await db.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Verify role match
        if (user.role !== role) {
            return res.status(403).json({ message: 'Selected role does not match account credentials.' });
        }

        // Check password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Fetch staff profile details if not Admin
        let staffProfile = null;
        if (role !== 'Admin' && role !== 'Centre Head') {
            // Find staff by user_id
            const allStaff = await db.getAllStaff();
            staffProfile = allStaff.find(s => s.user_id === user.id);
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, staff_id: staffProfile ? staffProfile.staff_id : null },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                staff_id: staffProfile ? staffProfile.staff_id : null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await db.createUser({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get additional staff info if applicable
        let staffProfile = null;
        if (user.role !== 'Admin' && user.role !== 'Centre Head') {
            const allStaff = await db.getAllStaff();
            staffProfile = allStaff.find(s => s.user_id === user.id);
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            staffProfile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving profile.' });
    }
};

module.exports = {
    login,
    register,
    getProfile
};
