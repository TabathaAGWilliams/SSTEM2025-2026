const express = require('express');
const path = require('path')
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));
// Home route
app.get('/', (req, res) => {
  res.send(path.join(__dirname, '..', 'index.html'));
});

// About route
app.get('/about', (req, res) => {
  res.send('<h1>About Page</h1><p>This is an Express.js server with Node.js.</p>');
});

// API routes
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ]
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.json({
    message: 'User created successfully',
    user: { id: 3, name, email }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

// Start server
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});