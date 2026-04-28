require('dotenv').config(); // This loads your .env file
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // This is the Postgres bridge

const app = express();
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
        // This asks Postgres for everything in the courses table
        const result = await pool.query('SELECT * FROM courses');
        
        // This sends the data back to the browser (or React) as JSON
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Save completed courses for a student
app.post('/api/records', async (req, res) => {
    // We expect the frontend to send us a User ID and an array of Course IDs
    const { user_id, course_ids } = req.body;

    try {
        // Loop through every checked course and insert it into the database
        for (let course_id of course_ids) {
            await pool.query(
                `INSERT INTO academic_records (user_id, course_id, status) 
                 VALUES ($1, $2, 'passed')
                 ON CONFLICT (user_id, course_id) DO NOTHING`,
                [user_id, course_id]
            );
        }
        
        res.json({ message: "Student records successfully updated!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});