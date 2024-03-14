const mongoose = require('mongoose');

const factorySchema = new mongoose.Schema({
  name: { type: String, required: true , uniqe: true },
  typeOfFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'typeOfFactory',
    required: true,
  },
  wasPaid:{type: Number , default:0}
  // Other fields related to factory
});

const Factory = mongoose.model('Factory', factorySchema);

module.exports = Factory;