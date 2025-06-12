const pool = require('../db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, p.pregnancy_status, p.due_date, p.last_period_date
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`, [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};