const mongoose = require('mongoose');


const paymentSaleSchema = new mongoose.Schema({
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sale',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date , required: true},
  amount: { type: Number , required: true},
  recived: { type: Number , required: true},
  balance: { type: Number , required: true},
  note: { type: String },
});


const paymentSale = mongoose.model('paymentSale', paymentSaleSchema);

module.exports = paymentSale;