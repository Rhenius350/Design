const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for bills
  billerName: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['transfer', 'recharge', 'bill_payment', 'loan_emi', 'investment', 'deposit'], default: 'transfer' },
  method: { type: String, enum: ['account', 'mobile', 'qr', 'upi', 'card', 'system'], default: 'account' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
