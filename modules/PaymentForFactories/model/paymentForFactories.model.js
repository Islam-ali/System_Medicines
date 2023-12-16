const mongoose = require("mongoose");
const paymentForFactorySchema = new mongoose.Schema({
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
    required: true,
  },
  wayOfPaymentId:{type: Number , required:true},
  cashAmount: { type: Number, required: true },
  cashDate: { type: Date , required: true },
  note: { type: String },
});

const PaymentForFactory = mongoose.model("PaymentForFactory", paymentForFactorySchema);

module.exports = PaymentForFactory;
