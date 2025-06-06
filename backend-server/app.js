const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const users = {};
const visits = [];

// Ensure head user 'prabhat' exists with password 'admin231'
users['prabhat'] = { password: 'admin231' };

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ success: false, message: 'User exists' });
    }
    users[username] = { password };
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/visit', (req, res) => {
    const { username, location, time } = req.body;
    if (!users[username]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    visits.push({ id: uuidv4(), username, location, time });
    res.json({ success: true });
});

app.get('/visits', (req, res) => {
    const username = req.query.username;
    if (username === 'prabhat') {
        // Head user can see all visits
        return res.json(visits);
    } else if (username && users[username]) {
        // Normal users see only their own visits
        return res.json(visits.filter(v => v.username === username));
    } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
