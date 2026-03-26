const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  cardNumber: { type: String, required: true, unique: true },
  expiry: { type: String, required: true },
  cvv: { type: String, required: true },
  limit: { type: Number, default: 0 }, // Applicable to credit
  usedLimit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
