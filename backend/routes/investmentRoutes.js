const express = require('express');
const router = express.Router();
const { getInvestments, invest } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInvestments);
router.post('/invest', protect, invest);

module.exports = router;
