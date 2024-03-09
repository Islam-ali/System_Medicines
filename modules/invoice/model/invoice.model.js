const mongoose = require('mongoose');


const invoiceSchema = new mongoose.Schema({
  date: { type: Date , required: true},
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
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sale',
    required: true,
  },
  // amount: { type: Number , required: true},
  // recived: { type: Number , required: true},
  // balance: { type: Number , required: true},
  note: { type: String },
});


const invoice = mongoose.model('invoices', invoiceSchema);

module.exports = invoice;