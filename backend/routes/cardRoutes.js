const express = require('express');
const router = express.Router();
const { getUserCards, issueCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserCards);
router.post('/issue', protect, issueCard);

module.exports = router;
