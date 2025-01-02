const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Helper function for database queries
async function dbQuery(query, params) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Database operation failed');
  }
}

// === ROUTES ===

// GET approved meals
app.get('/meals', async (req, res) => {
  try {
    const meals = await dbQuery('SELECT * FROM meals WHERE status = $1 ORDER BY id', ['approved']);
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve meals' });
  }
});

// POST a meal to pending
app.post('/meals', async (req, res) => {
  try {
    const { name, preparation_description, note, image_url, user_id } = req.body;
    const meal = await dbQuery(
      'INSERT INTO meals (name, preparation_description, note, image_url, user_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, preparation_description, note, image_url, user_id, 'pending']
    );
    res.status(201).json({ message: 'Meal submitted for review', meal: meal[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not create meal' });
  }
});

// GET approved products
app.get('/products', async (req, res) => {
  try {
    const products = await dbQuery('SELECT * FROM products WHERE status = $1 ORDER BY id', ['approved']);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve products' });
  }
});

// POST a product to pending
app.post('/products', async (req, res) => {
  try {
    const { name, note, image_url, user_id } = req.body;
    const product = await dbQuery(
      'INSERT INTO products (name, note, image_url, user_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, note, image_url, user_id, 'pending']
    );
    res.status(201).json({ message: 'Product submitted for review', product: product[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not create product' });
  }
});

// GET meal tags
app.get('/meals/:id/tags', async (req, res) => {
  try {
    const mealId = req.params.id;
    const tags = await dbQuery(
      `SELECT t.id, t.name, t.color_code 
       FROM meal_tags mt 
       JOIN tags t ON mt.tag_id = t.id 
       WHERE mt.meal_id = $1`,
      [mealId]
    );
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve meal tags' });
  }
});

// POST a tag to a meal
app.post('/meals/:id/tags', async (req, res) => {
  try {
    const mealId = req.params.id;
    const { tag_id } = req.body;
    await dbQuery('INSERT INTO meal_tags (meal_id, tag_id) VALUES ($1, $2)', [mealId, tag_id]);
    res.status(201).json({ message: 'Tag added to meal' });
  } catch (err) {
    res.status(500).json({ error: 'Could not add tag to meal' });
  }
});

// GET product tags
app.get('/products/:id/tags', async (req, res) => {
  try {
    const productId = req.params.id;
    const tags = await dbQuery(
      `SELECT t.id, t.name, t.color_code 
       FROM product_tags pt 
       JOIN tags t ON pt.tag_id = t.id 
       WHERE pt.product_id = $1`,
      [productId]
    );
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve product tags' });
  }
});

// POST a tag to a product
app.post('/products/:id/tags', async (req, res) => {
  try {
    const productId = req.params.id;
    const { tag_id } = req.body;
    await dbQuery('INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)', [productId, tag_id]);
    res.status(201).json({ message: 'Tag added to product' });
  } catch (err) {
    res.status(500).json({ error: 'Could not add tag to product' });
  }
});

// GET nutritional facts for a meal or product
app.get('/:type/:id/nutrition', async (req, res) => {
  try {
    const { type, id } = req.params; // type can be 'meals' or 'products'
    const nutrition = await dbQuery(
      'SELECT key, value FROM nutritional_facts WHERE item_type = $1 AND item_id = $2',
      [type.slice(0, -1), id] // Remove trailing 's' from type
    );
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve nutritional facts' });
  }
});

// POST nutritional facts for a meal or product
app.post('/:type/:id/nutrition', async (req, res) => {
  try {
    const { type, id } = req.params; // type can be 'meals' or 'products'
    const { key, value } = req.body;
    await dbQuery(
      'INSERT INTO nutritional_facts (item_type, item_id, key, value) VALUES ($1, $2, $3, $4)',
      [type.slice(0, -1), id, key, value]
    );
    res.status(201).json({ message: 'Nutritional fact added' });
  } catch (err) {
    res.status(500).json({ error: 'Could not add nutritional fact' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


