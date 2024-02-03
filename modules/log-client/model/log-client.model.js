const mongoose = require("mongoose");

const logClientSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
    required: true,
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sale",
  },
  paymentSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentSale",
  },
  creationBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  beforUpdateSale: { type: Object},
  afterUpdateSale: { type: Object},
  beforUpdatePaymentSale: { type: Object },
  afterUpdatePaymentSale: { type: Object },
  type: { type: String, required: true },
  methodName: { type: String, required: true },
  creationDate: { type: Date, required: true },
});

const logClientModel = mongoose.model("logClient", logClientSchema);

module.exports = logClientModel ;
