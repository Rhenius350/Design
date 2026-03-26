const Transaction = require('../models/Transaction');
const User = require('../models/User');

const sendMoney = async (req, res) => {
  const { receiverId, receiverMobile, amount, type = 'transfer', method = 'account', pin, paymentSource = 'account' } = req.body;
  const senderId = req.user.id;

  if (!pin) {
    return res.status(400).json({ message: 'Transaction PIN is required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send money to yourself' });
  }

  try {
    const sender = await User.findById(senderId);
    
    const isPinMatch = await require('bcryptjs').compare(pin, sender.pin || '');
    if (!isPinMatch && sender.pin) {
      return res.status(401).json({ message: 'Invalid Transaction PIN' });
    }

    let receiver;
    
    if (receiverId) {
      receiver = await User.findById(receiverId);
    } else if (receiverMobile) {
      receiver = await User.findOne({ mobile: receiverMobile });
    }

    if (!receiver && !receiverMobile) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    let usedCard = null;
    if (paymentSource !== 'account') {
      usedCard = await require('../models/Card').findOne({ _id: paymentSource, userId: senderId });
      if (!usedCard) return res.status(400).json({ message: 'Invalid payment card selected' });

      if (usedCard.type === 'credit') {
        const availableLimit = usedCard.limit - (usedCard.usedLimit || 0);
        if (availableLimit < amount) {
          return res.status(400).json({ message: 'Insufficient credit card limit' });
        }
        usedCard.usedLimit = (usedCard.usedLimit || 0) + amount;
      } else {
        if (sender.balance < amount) {
          return res.status(400).json({ message: 'Insufficient account balance for debit card' });
        }
        sender.balance -= amount;
      }
    } else {
      if (sender.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      sender.balance -= amount;
    }

    if (usedCard) await usedCard.save();
    if (receiver) {
      receiver.balance += amount;
      await receiver.save();
    }
    await sender.save();

    // Create transaction record
    let transactionData = {
      sender: senderId,
      amount,
      type: type || 'transfer',
      method,
      status: 'completed'
    };

    if (receiver) {
      transactionData.receiver = receiver._id;
    } else if (receiverMobile) {
      transactionData.billerName = `Unregistered Mobile: ${receiverMobile}`;
    }

    const transaction = await Transaction.create(transactionData);
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('sender', 'name email mobile')
      .populate('receiver', 'name email mobile');

    // Emit socket event for real-time update
    const io = req.io;
    const userSockets = req.userSockets;
    if (io && receiver && userSockets) {
      const receiverSocketId = userSockets.get(receiver._id.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_money', {
          transaction: populatedTransaction,
          newBalance: receiver.balance
        });
      }
    }

    res.status(201).json({
      message: 'Transaction successful',
      transaction: populatedTransaction,
      newBalance: sender.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getHistory = async (req, res) => {
  const userId = req.user.id;
  const { filter } = req.query;

  try {
    let query = { $or: [{ sender: userId }, { receiver: userId }] };
    if (filter && filter !== 'all') {
      if (filter === 'credit') {
        query = { receiver: userId, type: 'transfer' };
      } else if (filter === 'debit') {
        query = { sender: userId, type: 'transfer' };
      } else {
        query = { sender: userId, type: filter }; // recharge, bill_payment, etc
      }
    }

    const transactions = await Transaction.find(query)
    .populate('sender', 'name email mobile')
    .populate('receiver', 'name email mobile')
    .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const processRechargeOrBill = async (req, res) => {
  const { amount, billerName, type, method, pin, paymentSource = 'account' } = req.body;
  const userId = req.user.id;

  if (!pin) return res.status(400).json({ message: 'Transaction PIN is required' });
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const user = await User.findById(userId);
    
    const isPinMatch = await require('bcryptjs').compare(pin, user.pin || '');
    if (!isPinMatch && user.pin) {
      return res.status(401).json({ message: 'Invalid Transaction PIN' });
    }

    let usedCard = null;
    if (paymentSource !== 'account') {
      usedCard = await require('../models/Card').findOne({ _id: paymentSource, userId });
      if (!usedCard) return res.status(400).json({ message: 'Invalid payment card selected' });

      if (usedCard.type === 'credit') {
        const availableLimit = usedCard.limit - (usedCard.usedLimit || 0);
        if (availableLimit < amount) {
          return res.status(400).json({ message: 'Insufficient credit card limit' });
        }
        usedCard.usedLimit = (usedCard.usedLimit || 0) + amount;
      } else {
        if (user.balance < amount) {
          return res.status(400).json({ message: 'Insufficient account balance for debit card' });
        }
        user.balance -= amount;
      }
    } else {
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.balance -= amount;
    }

    if (usedCard) await usedCard.save();
    await user.save();

    const transaction = await Transaction.create({
      sender: userId,
      billerName,
      amount,
      type, // recharge or bill_payment
      method: method || 'system',
      status: 'completed'
    });

    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const toMobile = user.mobile.startsWith('+') ? user.mobile : `+91${user.mobile}`; // Defaulting to +91
        await client.messages.create({
          body: `SmartBank Alert: ${type.replace('_',' ')} of Rs.${amount} for ${billerName} was successful. Txn ID: ${transaction._id}.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: toMobile
        });
        console.log(`SMS sent successfully to ${toMobile}`);
      } else {
        console.log(`\n[MOCK SMS SIMULATION] To: ${user.mobile} | Body: SmartBank Alert: ${type.replace('_',' ')} of Rs.${amount} for ${billerName} was successful.\n`);
      }
    } catch (smsError) {
      console.error('Failed to send SMS via Twilio:', smsError.message);
    }

    res.status(201).json({
      message: `${type} successful`,
      transaction: transaction,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
}

module.exports = { sendMoney, getHistory, processRechargeOrBill };
