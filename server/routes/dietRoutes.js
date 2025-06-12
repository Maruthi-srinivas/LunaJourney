const express = require('express');
const { getOrGenerateDietPlan } = require('../controllers/dietPlan');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getOrGenerateDietPlan);

module.exports = router;