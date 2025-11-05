require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('cors');
const bodyParse = require('body-parser');
const bodyParser = require('body-parser');
const { createTunnel } = require('tunnel-ssh');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

//mysql connection

const sshConfig = {
  host: 'sstem.cs.appstate.edu:22',
  port: 22,
  username: 'geltta',
  password: process.env.SSH_PASSWORD,
  dstHost: '127.0.0.1',
  dstPort: 3306,
  localHost: '127.0.0.1',
  localPort: 3307

}
let db;
let server;

async function connectToDatabase() {
  try {
    const [server_instance, client] = await createTunnel ({}, {}, sshConfig);
    server = server_instance;
    console.log('SSH connection established!!!');

    db = mysql.createConnection ({
      host: '127.0.0.1',
      user: '3307',
      password: process.env.MYSQL_PASSWORD,
      database: 'tavelJournal'
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