const express = require('express');
const router = express.Router();
const { getLoans, applyLoan, payEmi } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLoans);
router.post('/apply', protect, applyLoan);
router.post('/pay-emi', protect, payEmi);

module.exports = router;
