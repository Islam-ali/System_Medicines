const mongoose = require('mongoose');


const paymentClientSchema = new mongoose.Schema({
  // saleId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'sale',
  //   required: true,
  // },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date , required: true},
  amount: { type: Number , required: true},
  note: { type: String },
});


const paymentClient = mongoose.model('paymentClient', paymentClientSchema);

module.exports = paymentClient;