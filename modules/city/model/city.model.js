const mongoose = require('mongoose');


const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  governmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'government',
    required: true,
  },
});


const city = mongoose.model('city', citySchema);

module.exports = city;