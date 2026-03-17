const mongoose = require('mongoose');

const cabSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, trim: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  route: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Cab', cabSchema);
