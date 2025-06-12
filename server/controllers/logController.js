const pool = require('../db');
exports.createLog = async (req, res) => {
  const { userId, date, weight, systolic, diastolic, mood, symptoms, notes, waterIntake } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO daily_logs 
        (user_id, log_date, weight, systolic_bp, diastolic_bp, mood, water_intake, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, date, weight, systolic, diastolic, mood, waterIntake, notes]
    );
    const logId = r.insertId;
    for (const symptom of symptoms) {
      await pool.query(
        `INSERT INTO daily_log_symptoms (log_id, symptom) VALUES (?, ?)`,
        [logId, symptom]
      );
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save daily log' });
  }
};