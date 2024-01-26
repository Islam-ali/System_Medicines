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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date , required: true},
  // payment: { type: Number},
  discount: { type: Number , required: true},
  bouns: { type: Number , required: true},
  salesQuantity: { type: Number, required: true },
  pharmacyPrice: { type: Number, required: true },
  salesValue: { type: Number , required: true}, // salesQuantity * pharmacyPrice
  received: { type: Number , required: true},
  balance: { type: Number}, // salesValue - received
  netProfit: { type: Number, required: true }, // pharmacyPrice - factoryPrice
  totalNetProfit: { type: Number, required: true }, // received - (salesQuantity - factoryPrice)
  profit:{ type: Number }, // after discount
});


const sale = mongoose.model('sale', saleSchema);

module.exports = sale;