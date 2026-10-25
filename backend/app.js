require('dotenv').config(); 

const express = require('express');
const mariadb = require('mariadb');

const {
  MARIADB_HOST = '172.17.0.2',
  MARIADB_PORT = '3306',
  MARIADB_USER = 'root',
  MARIADB_PASSWORD = 'sick',
  MARIADB_DATABASE = 'testdb',
  PORT = 3000
} = process.env;

const pool = mariadb.createPool({
  host: MARIADB_HOST,
  port: Number(MARIADB_PORT),
  user: MARIADB_USER,
  password: MARIADB_PASSWORD,
  database: MARIADB_DATABASE,
  connectionLimit: 5
});

const app = express();
app.use(express.json());

async function withConn(fn) {
  let conn;
  try {
    conn = await pool.getConnection();
    return await fn(conn);
  } finally {
    if (conn) conn.release();
  }
}

async function ensureSchema() {
  await withConn(async (conn) => {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  });
}

// Health check
app.get('/ping', (req, res) => res.json({ ok: true }));

// List users
app.get('/users', async (req, res) => {
  try {
    const rows = await withConn(conn => conn.query('SELECT id, name, email, created_at FROM users ORDER BY id DESC'));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get user by id
app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const rows = await withConn(conn => conn.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]));
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Create user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  try {
    const result = await withConn(conn => conn.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]));
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});


// Start server after ensuring schema
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize DB schema', err);
    process.exit(1);
  });