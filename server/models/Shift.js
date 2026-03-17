const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  label: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
