import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { ScanHistory } from './models/ScanHistory.js';
import { ContactMessage } from './models/ContactMessage.js';
import { detectSpam } from './lib/horspool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'spamshield_fallback_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spamshield';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('MongoDB database connection error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
};

// ---------------- AUTH ROUTES ----------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Demo/Guest Login (highly helpful for quick presentations)
app.post('/api/auth/demo', async (req, res) => {
  try {
    const demoEmail = 'guest@spamshield.com';
    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      const hashedPassword = await bcryptjs.hash('demo1234', 10);
      user = new User({
        name: 'Demo Guest',
        email: demoEmail,
        password: hashedPassword
      });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- SCAN ROUTES ----------------

// Run Detection
app.post('/api/scans', authenticateToken, async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    const scanResult = detectSpam(content);

    // Save to MongoDB history
    const history = new ScanHistory({
      userId: req.user.userId,
      subject,
      content,
      isSpam: scanResult.isSpam,
      spamScore: scanResult.spamScore,
      matchedKeywords: scanResult.matches.map(m => m.keyword),
      executionTime: scanResult.executionTime
    });
    await history.save();

    res.json({ ...scanResult, scanId: history._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Scan History & Analytics Statistics
app.get('/api/scans', authenticateToken, async (req, res) => {
  try {
    const scans = await ScanHistory.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    // Aggregate statistics
    const totalScans = scans.length;
    const spamScans = scans.filter(s => s.isSpam).length;
    const cleanScans = totalScans - spamScans;

    let averageSpeed = 0;
    if (totalScans > 0) {
      const sumSpeed = scans.reduce((acc, curr) => acc + curr.executionTime, 0);
      averageSpeed = parseFloat((sumSpeed / totalScans).toFixed(4));
    }

    // Format data for timeline (past 7 scans)
    const recentStats = scans.slice(0, 10).map(s => ({
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.spamScore,
      speed: s.executionTime
    })).reverse();

    res.json({
      history: scans,
      stats: {
        totalScans,
        spamScans,
        cleanScans,
        averageSpeed,
        recentStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- CONTACT ROUTES ----------------

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new ContactMessage({ name, email, message });
    await contact.save();

    res.json({ success: true, message: 'Message saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Port listener
app.listen(PORT, () => {
  console.log(`Express API running on port ${PORT}`);
});
