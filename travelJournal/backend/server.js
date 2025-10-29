const express = require('express');
const mysql = require('mysql2');
const path = require('cors');
const bodyParse = require('body-parser');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

//mysql connection
const db = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'something',
  database: 'tavel_journal'
})

db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!!!!');
})

app.post('/api/entries', (req, res) => {
  const {title, location, content, date} = req.body;
  const sql = 'Insert into entries (title, location, content, date) values (?, ?, ?, ?)';
  db.query(sql, [title, location, content, date], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Entry was added successfully!', id: result.insertId});
  });
});

app.get('/api/entries', (req, res) => {
  const sql = 'Select * from entries order by date desc';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});



// Start server
app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});