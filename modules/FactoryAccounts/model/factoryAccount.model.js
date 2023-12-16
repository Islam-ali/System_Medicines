const mongoose = require("mongoose");
const FactoryAccountLogSchema = new mongoose.Schema({
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
    required: true,
  },
  paymentForFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentForFactory",
    required: true,
  },
  wayOfPaymentId: { type: Number, required: true },
  cashAmount: { type: Number, required: true, default: 0 },
  cashDate: { type: Date, required: true },
  balance: { type: Number, required: true, default: 0 },
  note: { type: String },
});

const FactoryAccountLog = mongoose.model(
  "FactoryAccountLog",
  FactoryAccountLogSchema
);

module.exports = FactoryAccountLog;
