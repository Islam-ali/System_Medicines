const mongoose = require("mongoose");
const paymentForFactorySchema = new mongoose.Schema({
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Factory",
    required: true,
  },
  wayOfPaymentId: { type: Number },
  cashAmount: { type: Number, required: true },
  cashDate: { type: Date, required: true },
  // balance: { type: Number, required: true, default: 0 },
  note: { type: String },
  // itemName: { type: String, required: true },
});

const PaymentForFactory = mongoose.model("PaymentForFactory", paymentForFactorySchema);

module.exports = PaymentForFactory;
