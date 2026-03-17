const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  type: { type: String, enum: ['pickup', 'dropoff'], required: true },
  date: { type: String, required: true },
  acknowledged: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Cancellation', cancellationSchema);
