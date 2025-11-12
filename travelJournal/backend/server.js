require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // FIXED: was 'path'
const bodyParser = require('body-parser');
const { createTunnel } = require('tunnel-ssh');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// SSH and MySQL configuration
const sshConfig = {
  host: 'sstem.cs.appstate.edu', // FIXED: removed :22
  port: 22,
  username: 'geltta',
  password: process.env.SSH_PASSWORD,
  dstHost: '127.0.0.1',
  dstPort: 3306,
  localHost: '127.0.0.1',
  localPort: 3307
};

let db;
let server;

async function connectToDatabase() {
  try {
    const [server_instance, client] = await createTunnel({}, {}, sshConfig);
    server = server_instance;
    console.log('SSH connection established!!!');

    db = mysql.createConnection({
      host: '127.0.0.1',
      port: 3307, // FIXED: was in 'user' field
      user: 'geltta', // FIXED: should be your username, not port
      password: process.env.MYSQL_PASSWORD,
      database: 'travelJournal' // Note: typo in 'travel'? Should be 'travelJournal'?
    });
    
    db.connect(err => {
      if (err) {
        console.error('MySQL connection error:', err);
        throw err;
      }
      console.log('Connected to the database!!!!');
    });

  } catch (error) {
    console.error('SSH tunnel error:', error);
    throw error;
  }
}

// POST - Create new entry
app.post('/api/entries', (req, res) => {
  const { title, location, content, date } = req.body;
  
  // Validation
  if (!date || !content) {
    return res.status(400).json({ error: 'date and content are required' });
  }
  
  const sql = 'INSERT INTO journalEntries (title, location, content, date) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, location, content, date], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Failed to add entry', details: err.message });
    }
    res.status(201).json({ message: 'Entry was added successfully!', id: result.insertId });
  });
});

// GET - Retrieve all entries
app.get('/api/entries', (req, res) => {
  const sql = 'SELECT * FROM journalEntries ORDER BY date DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to fetch entries', details: err.message });
    }
    res.json(results);
  });
});

// GET - Retrieve single entry by ID
app.get('/api/entries/:id', (req, res) => {
  const sql = 'SELECT * FROM journalEntries WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to fetch entry', details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(results[0]);
  });
});

// PUT - Update entry
app.put('/api/entries/:id', (req, res) => {
  const { title, location, content, date } = req.body;
  
  if (!date || !content) {
    return res.status(400).json({ error: 'date and content are required' });
  }
  
  const sql = 'UPDATE journalEntries SET title = ?, location = ?, content = ?, date = ? WHERE id = ?';
  db.query(sql, [title, location, content, date, req.params.id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update entry', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry updated successfully!' });
  });
});

// DELETE - Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const sql = 'DELETE FROM journalEntries WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete entry', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully!' });
  });
});

// Initialize database connection and start server
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing connections...');
  if (db) db.end();
  if (server) server.close();
  process.exit(0);
});