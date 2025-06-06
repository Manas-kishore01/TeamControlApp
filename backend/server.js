const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory users and data
const users = { prabhat: { password: 'admin231', isAdmin: true } };
const records = [];

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    if (users[username]) return res.status(400).json({ success: false, message: 'User exists' });
    users[username] = { password, isAdmin: false };
    res.json({ success: true });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        res.json({ success: true, isAdmin: users[username].isAdmin });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Submit data endpoint
app.post('/submit', (req, res) => {
    const { username, location, time, work } = req.body;
    if (!users[username]) return res.status(401).json({ success: false, message: 'Unauthorized' });
    records.push({ id: uuidv4(), username, location, time, work });
    res.json({ success: true });
});

// Fetch data endpoint
app.get('/records', (req, res) => {
    const { username } = req.query;
    if (!users[username]) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (users[username].isAdmin) {
        res.json(records);
    } else {
        res.json(records.filter(r => r.username === username));
    }
});

// Serve frontend static files if in production (Render)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server running on port', PORT));
