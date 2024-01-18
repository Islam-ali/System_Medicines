const mongoose = require('mongoose');


const saleSchema = new mongoose.Schema({
  branchStockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branchStock',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
    required: true,
  },
  salesQuantity: { type: Number, required: true },
  pharmacyPrice: { type: Number, required: true },
  salesValue: { type: Number , required: true}, // salesQuantity * pharmacyPrice
  discount: { type: Number, required: true },
  bouns: { type: Number, required: true }, // bouns = salesQuantity
  received: { type: Number, required: true },
  balance: { type: Number, required: true },
  netProfit: { type: Number, required: true }, // pharmacyPrice - factoryPrice
  totalNetProfit: { type: Number, required: true }, // received - (salesQuantity - factoryPrice)
  date: { type: Date , required: true},

});


const sale = mongoose.model('sale', saleSchema);

module.exports = sale;