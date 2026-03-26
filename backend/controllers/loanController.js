const Loan = require('../models/Loan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const applyLoan = async (req, res) => {
  const { amount, tenure, pin } = req.body;
  if (!pin) return res.status(400).json({ message: 'Transaction PIN is required' });
  try {
    const user = await User.findById(req.user.id);
    const isPinMatch = await require('bcryptjs').compare(pin, user.pin || '');
    if (!isPinMatch && user.pin) return res.status(401).json({ message: 'Invalid Transaction PIN' });
    const interestRate = 10; // 10% flat
    const totalPayable = amount + (amount * interestRate / 100);
    const emiAmount = totalPayable / tenure;

    const loan = await Loan.create({
      userId: req.user.id,
      amount,
      interestRate,
      tenure,
      emiAmount,
      totalPayable
    });
    
    // Deposit amount to bank balance
    user.balance += amount;
    await user.save();
    
    await Transaction.create({
       sender: user._id, // System
       receiver: user._id,
       amount,
       type: 'deposit',
       method: 'system',
       status: 'completed'
    });
    
    res.status(201).json(loan);
  } catch(err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

const payEmi = async (req, res) => {
  const { loanId, pin } = req.body;
  if (!pin) return res.status(400).json({ message: 'Transaction PIN is required' });
  try {
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status === 'closed') return res.status(400).json({ message: 'Invalid loan' });
    
    const user = await User.findById(req.user.id);
    const isPinMatch = await require('bcryptjs').compare(pin, user.pin || '');
    if (!isPinMatch && user.pin) return res.status(401).json({ message: 'Invalid Transaction PIN' });

    if (user.balance < loan.emiAmount) return res.status(400).json({ message: 'Insufficient balance' });
    
    user.balance -= loan.emiAmount;
    await user.save();
    
    loan.amountPaid += loan.emiAmount;
    if (loan.amountPaid >= loan.totalPayable) loan.status = 'closed';
    await loan.save();
    
    await Transaction.create({
       sender: user._id,
       amount: loan.emiAmount,
       type: 'loan_emi',
       method: 'system',
       status: 'completed'
    });
    
    res.json({ message: 'EMI Paid', loan, newBalance: user.balance });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
module.exports = { getLoans, applyLoan, payEmi };
