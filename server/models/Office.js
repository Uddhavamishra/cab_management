const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Office', officeSchema);
