const mongoose = require("mongoose");
const FactoryAccountLogSchema = new mongoose.Schema({
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
    required: true,
  },
  wayOfPaymentId: { type: Number},
  cashAmount: { type: Number, required: true, default: 0 },
  cashDate: { type: Date, required: true },
});

const FactoryAccountLog = mongoose.model(
  "FactoryAccountLog",
  FactoryAccountLogSchema
);

module.exports = FactoryAccountLog;
