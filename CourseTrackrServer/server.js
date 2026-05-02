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
// Helper function to force "Title Case"

const { formatTitleCase } = require('./utils');
// Your routes go below this...
// app.post('/api/students', async (req, res) => { ...
// Inside your Node/Express server
// GET /api/students - Fetch only ACTIVE students
// GET /api/students - Fetch only ACTIVE students
// GET /api/students - Fetch only ACTIVE students
// GET /api/students - Fetch only ACTIVE students
app.get('/api/students', async (req, res) => {
  try {
    const allStudents = await pool.query(`
        SELECT 
            id, 
            first_name, 
            last_name, 
            first_name || ' ' || last_name AS name, 
            email, 
            school_id, 
            year_standing 
        FROM users 
        WHERE role = 'student' AND is_active = true
        ORDER BY last_name ASC
    `); 
    res.json(allStudents.rows);
  } catch (err) {
    console.error("Fetch Students Error:", err.message);
    res.status(500).send("Server Error");
  }
});


// GET /api/student-records/:user_id - Feed the Dashboard Cards
// GET /api/student-records/:user_id - Feed the Dashboard Cards
app.get('/api/student-records/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (isNaN(user_id)) {
        return res.status(200).json([]);
    }

    try {
        const recordsRes = await pool.query(`
            SELECT c.id, c.code, c.title AS name, c.units, ar.status, ar.is_petitioned 
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
// POST /api/records - Save student course selections from Setup
app.post('/api/records', async (req, res) => {
    const { user_id, records, year_standing } = req.body;

    try {
        // 1. Wipe old records for this specific user
        await pool.query('DELETE FROM academic_records WHERE user_id = $1', [user_id]);

        // 2. Insert each record sent from the Setup page
        for (let record of records) {
            await pool.query(
                'INSERT INTO academic_records (user_id, course_id, status, is_petitioned) VALUES ($1, $2, $3, $4)',
                [user_id, record.course_id, record.status, record.is_petitioned || false]
            );
        }

        // 3. Update Year Standing
        if (year_standing) {
            await pool.query(
                'UPDATE users SET year_standing = $1 WHERE id = $2',
                [year_standing, user_id]
            );
        }

        res.status(200).json({ message: "Academic records updated successfully!" });

    } catch (err) {
        console.error("Database Save Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// DELETE /api/students/:id - "Soft Delete" (Archive) a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 🚨 We no longer delete academic_records! 
    // We just update the user to hide them from the main system.
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);

    res.status(200).json({ message: "Student successfully archived." });
  } catch (err) {
    console.error("Archive Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Create a new course petition
app.post('/api/petitions', async (req, res) => {
  const { student_id, course_id } = req.body;

  try {
    // Check if the student already has a 'pending' petition for this exact course
    const checkQuery = `
      SELECT * FROM petitions 
      WHERE user_id = $1 AND course_id = $2 AND status = 'pending'
    `;
    const existingPetition = await pool.query(checkQuery, [student_id, course_id]);

    if (existingPetition.rows.length > 0) {
      return res.status(400).json({ message: "You already have a pending petition for this course." });
    }

    // Insert the new petition
    const insertQuery = `
      INSERT INTO petitions (user_id, course_id, status) 
      VALUES ($1, $2, 'pending') 
      RETURNING *
    `;
    const newPetition = await pool.query(insertQuery, [student_id, course_id]);

    res.status(201).json({ 
      message: "Petition submitted successfully", 
      petition: newPetition.rows[0] 
    });

  } catch (error) {
    console.error("Error submitting petition:", error);
    res.status(500).json({ error: "Failed to submit petition." });
  }
});

// GET: Fetch all active petitions (Grouped for the Admin Dashboard)
app.get('/api/petitions', async (req, res) => {
  try {
    const groupedQuery = `
      SELECT 
        p.course_id,
        COUNT(p.id) as total_requests,
        json_agg(
          json_build_object(
            'petition_id', p.id,
            'student_id', u.id,
            'school_id', u.school_id,
            'student_name', u.first_name || ' ' || u.last_name,
            'status', p.status,
            'date_requested', p.created_at
          )
        ) as students
      FROM petitions p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
      GROUP BY p.course_id
      ORDER BY total_requests DESC;
    `;

    const result = await pool.query(groupedQuery);
    
    // The result is a beautifully formatted JSON array ready for your React Admin Dashboard
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error fetching petitions:", error);
    res.status(500).json({ error: "Failed to fetch petitions." });
  }
});

app.post('/api/petitions/:id/approve', async (req, res) => {
  const petitionId = req.params.id;
  const { studentId, courseId } = req.body;

  try {
    // 1. Update petition status
    await pool.query('UPDATE petitions SET status = $1 WHERE id = $2', ['approved', petitionId]);

    // 2. "Unlock" the course by adding it to student_records
    // We set status to 'passed' so the student's logic clears the prerequisite
    await pool.query(
      'INSERT INTO academic_records (student_id, course_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [studentId, courseId, 'passed']
    );

    res.status(200).json({ message: "Petition approved and course unlocked." });
  } catch (err) {
    res.status(500).json({ error: "Database error during approval." });
  }
});

// PUT: Update a student's basic profile
app.put('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const { first_name, last_name, school_id, email, year_standing } = req.body;

  try {
    const updateQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, school_id = $3, email = $4, year_standing = $5 
      WHERE id = $6
    `;
    await pool.query(updateQuery, [first_name, last_name, school_id, email, year_standing, studentId]);

    res.status(200).json({ message: "Student profile updated successfully!" });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ error: "Failed to update student profile in database." });
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});