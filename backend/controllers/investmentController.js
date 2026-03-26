const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    res.json(investments);
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

const invest = async (req, res) => {
  const { type, assetName, amount, pin } = req.body;
  if (!pin) return res.status(400).json({ message: 'Transaction PIN is required' });

  try {
    const user = await User.findById(req.user.id);
    
    const isPinMatch = await require('bcryptjs').compare(pin, user.pin || '');
    if (!isPinMatch && user.pin) return res.status(401).json({ message: 'Invalid Transaction PIN' });

    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    
    user.balance -= amount;
    await user.save();
    
    const investment = await Investment.create({
      userId: user._id,
      type,
      assetName,
      investedAmount: amount,
      currentValue: amount * 1.05, // simulated +5% current value
      units: amount / 100 // dummy
    });
    
    await Transaction.create({
       sender: user._id,
       amount,
       type: 'investment',
       method: 'system',
       status: 'completed'
    });
    
    res.status(201).json(investment);
  } catch (err) { res.status(500).json({ message: 'Error: ' + err.message }); }
};

module.exports = { getInvestments, invest };
