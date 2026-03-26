const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['mutual_fund', 'stock', 'fixed_deposit'], required: true },
  assetName: { type: String, required: true },
  investedAmount: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  units: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
