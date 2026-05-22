require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const registrationSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true },
  phone:        String,
  ticketType:   { type: String, required: true },
  track:        { type: String, required: true },
  sessions:     [String],
  dietary:      String,
  notes:        String,
  registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, ticketType, track } = req.body;
    if (!firstName || !lastName || !email || !ticketType || !track)
      return res.status(400).json({ error: 'Missing required fields.' });
    const existing = await Registration.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'This email is already registered.' });
    const doc = await Registration.create(req.body);
    res.status(201).json({ message: 'Registration successful!', id: doc._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const docs = await Registration.find().sort({ registeredAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

mongoose.connect(process.env.MONGODB_URI);

module.exports = app;