const Card = require('../models/Card');
const User = require('../models/User');

const getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const issueCard = async (req, res) => {
  const { type, limit } = req.body; // 'debit' or 'credit'
  try {
    const existingCard = await Card.findOne({ userId: req.user.id, type });
    if (existingCard) {
      return res.status(400).json({ message: `You already have a ${type} card.` });
    }

    const cardNumber = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
    const cvv = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const expiry = '12/30';
    
    const card = await Card.create({
      userId: req.user.id,
      type,
      cardNumber,
      expiry,
      cvv,
      limit: type === 'credit' ? (limit || 50000) : 0
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getUserCards, issueCard };
