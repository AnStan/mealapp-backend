const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Use environment variables for DB connection
// We'll set them in ECS (DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, etc.)
const pool = new Pool({
  host: process.env.DB_HOST,    // e.g. mealapp-db.xxx.eu-north-1.rds.amazonaws.com
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Example tables: meals_official, meals_pending, products_official, products_pending
// We'll do basic routes:

// GET official meals
app.get('/meals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meals_official ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve meals' });
  }
});

// POST a meal to pending
app.post('/meals', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO meals_pending (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json({ message: 'Meal submitted for review', meal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create meal' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
