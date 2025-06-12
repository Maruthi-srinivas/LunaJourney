// filepath: c:\game\rproject\server\utils\jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });
};