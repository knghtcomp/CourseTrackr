const bcrypt = require('bcrypt');
require('dotenv').config(); // This loads your .env file
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // This is the Postgres bridge

const app = express();
app.use(cors());

const PORT = 5000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Set up the Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Test the Connection!
pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL database!'))
    .catch(err => console.error('❌ Database connection error:', err.message));

// A simple test route
app.get('/api/status', (req, res) => {
    res.json({ message: "CourseTrackr Backend is live and listening!" });
});

// Fetch all courses from the database
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM courses');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/setup - Catch the Green (Finished) and Yellow (Ongoing) courses
app.post('/api/setup', async (req, res) => {
    const { user_id, year_standing, records } = req.body;

    try {
        if (year_standing) {
            await pool.query(
                'UPDATE users SET year_standing = $1 WHERE id = $2',
                [year_standing, user_id]
            );
        }

        await pool.query('DELETE FROM academic_records WHERE user_id = $1', [user_id]);

        for (let record of records) {
            await pool.query(
                `INSERT INTO academic_records (user_id, course_id, status) 
                 VALUES ($1, $2, $3)`,
                [user_id, record.course_id, record.status] 
            );
        }

        res.status(200).json({ message: "Academic setup saved successfully!" });

    } catch (err) {
        console.error("Save Setup Error:", err.message);
        res.status(500).json({ message: "Server Error saving setup." });
    }
});

// GET /api/student-records/:user_id - Feed the Dashboard Cards
app.get('/api/student-records/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const recordsRes = await pool.query(`
            SELECT c.id, c.code, c.title AS name, c.units, ar.status 
            FROM academic_records ar
            JOIN courses c ON ar.course_id = c.id
            WHERE ar.user_id = $1
        `, [user_id]);

        res.status(200).json(recordsRes.rows);

    } catch (err) {
        console.error("Fetch Records Error:", err.message);
        res.status(500).json({ message: "Server Error fetching records." });
    }
});

// POST /api/verify - Check if a student can take a specific course
app.post('/api/verify', async (req, res) => {
    const { user_id, target_course_id } = req.body;

    try {
        const courseRes = await pool.query('SELECT code, title, prerequisites FROM courses WHERE id = $1', [target_course_id]);
        
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        const targetCourse = courseRes.rows[0];
        const requiredPreReqs = targetCourse.prerequisites; 

        const historyRes = await pool.query(`
            SELECT c.code 
            FROM academic_records ar
            JOIN courses c ON ar.course_id = c.id
            WHERE ar.user_id = $1 AND ar.status = 'passed'
        `, [user_id]);

        const passedCourseCodes = historyRes.rows.map(row => row.code);

        let isCompliant = true;
        let missingPreReqs = [];

        if (requiredPreReqs && requiredPreReqs.length > 0 && requiredPreReqs[0] !== 'None') {
            for (let req of requiredPreReqs) {
                if (req.includes("Year")) {
                    const requiredYear = parseInt(req[0]); 
        
                    const userRes = await pool.query('SELECT year_standing FROM users WHERE id = $1', [user_id]);
                    const studentYear = userRes.rows[0].year_standing;

                    if (studentYear < requiredYear) {
                        isCompliant = false;
                        missingPreReqs.push(req);
                    }
                } 
                else if (!passedCourseCodes.includes(req)) {
                    isCompliant = false;
                    missingPreReqs.push(req);
                }
            }
        }

        res.json({
            course: targetCourse.code,
            compliant: isCompliant,
            missing: missingPreReqs,
            message: isCompliant 
                ? `Student is cleared to take ${targetCourse.code}.` 
                : `Warning: Student is missing prerequisites: ${missingPreReqs.join(', ')}`
        });

    } catch (err) {
        console.error("Verification Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/signup - Create a new user account
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, idNumber, email, password, role } = req.body;

    try {
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR school_id = $2', 
            [email, idNumber]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "An account with this Email or ID Number already exists." });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const yearStanding = role === 'student' ? 1 : null;

        // 🚨 THE BACKEND FIX: Added last_name and year_standing to the RETURNING clause
        const newUser = await pool.query(
            `INSERT INTO users (school_id, role, first_name, last_name, email, password_hash, year_standing)
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, role, first_name, last_name, year_standing`,
            [idNumber, role, firstName, lastName, email, passwordHash, yearStanding]
        );

        const savedUser = newUser.rows[0];

        // Format the user object perfectly for the React frontend
        res.status(201).json({ 
            message: "Account created successfully!", 
            user: {
                id: savedUser.id,
                role: savedUser.role,
                firstName: savedUser.first_name,
                lastName: savedUser.last_name,
                yearStanding: savedUser.year_standing
            }
        });

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).json({ message: "Server Error during signup." });
    }
});

// POST /api/login - Verify user credentials
app.post('/api/login', async (req, res) => {
    const { idNumber, password, role } = req.body;

    try {
        const userRes = await pool.query(
            'SELECT * FROM users WHERE school_id = $1 AND role = $2', 
            [idNumber, role]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ 
                message: "Account not found. Please click 'SIGN UP' to create your account first." 
            });
        }

        const user = userRes.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                yearStanding: user.year_standing
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server Error during login." });
    }
});

// POST /api/records - Save student course selections from Setup
app.post('/api/records', async (req, res) => {
    const { user_id, records } = req.body;

    try {
        await pool.query('DELETE FROM academic_records WHERE user_id = $1', [user_id]);

        for (let record of records) {
            await pool.query(
                `INSERT INTO academic_records (user_id, course_id, status) 
                 VALUES ($1, $2, $3)`,
                [user_id, record.course_id, record.status]
            );
        }

        if (req.body.year_standing) {
            await pool.query(
                'UPDATE users SET year_standing = $1 WHERE id = $2',
                [req.body.year_standing, user_id]
            );
        }

        res.status(200).json({ message: "Academic setup saved successfully!" });

    } catch (err) {
        console.error("Save Records Error:", err.message);
        res.status(500).json({ message: "Server Error saving records." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});