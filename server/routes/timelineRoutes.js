const express = require('express');
const { getOrGenerateTimeline } = require('../controllers/TimeLine');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getOrGenerateTimeline);

module.exports = router;