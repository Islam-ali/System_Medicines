const mongoose = require("mongoose");
const paymentPrivateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String },
});

const PaymentPrivate = mongoose.model("PaymentPrivate", paymentPrivateSchema);

module.exports = PaymentPrivate;
