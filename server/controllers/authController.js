const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { generateToken } = require('../utils/jwtUtils');

exports.signup = async (req, res) => {
  const { email, password, name, pregnancyWeek } = req.body;
  try {
    // Check if user exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    const user = { id: result.insertId, email, name };

    // Calculate last_period_date from pregnancyWeek
    if (pregnancyWeek) {
      const now = new Date();
      const weekInMillis = (parseInt(pregnancyWeek) - 1) * 7 * 24 * 60 * 60 * 1000;
      const lastPeriodDate = new Date(now - weekInMillis);
      const formattedDate = lastPeriodDate.toISOString().slice(0, 10);
      
      // Insert into user_profiles
      await pool.query(
        'INSERT INTO user_profiles (user_id, last_period_date) VALUES (?, ?)',
        [user.id, formattedDate]
      );
    }

    res.status(201).json({ token: generateToken(user.id), user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token: generateToken(user.id), user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};