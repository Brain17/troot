const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const csvWriter = createCsvWriter({
  path: 'data.csv',
  header: [{ id: 'username', title: 'Username' }, { id: 'password', title: 'Password' }],
});

// Load existing data from data.csv
const users = [];

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    users.push(row);
  });

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Add the new user to the array and write to the CSV file
  users.push({ username, password });

  csvWriter
    .writeRecords(users)
    .then(() => {
      res.status(201).json({ message: 'User registered successfully' });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Registration failed' });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
