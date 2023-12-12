const mongoose = require('mongoose');

const itemsFactorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Factory',
    required: true,
  },
  // Other fields related to factory
});

const itemsFactory = mongoose.model('ItemsFactory', itemsFactorySchema);

module.exports = itemsFactory;