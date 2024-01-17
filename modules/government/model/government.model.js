const mongoose = require('mongoose');


const governmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});


const government = mongoose.model('government', governmentSchema);

module.exports = government;