const mongoose = require("mongoose");
const paymentType = require("../../../core/enums/paymentType.enum");
const paymentForFactorySchema = new mongoose.Schema({
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Factory",
    required: true,
  },
  // itemFactoryId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "ItemsFactory",
  //   default: null
  // },
  paymentType: {
    type: String,
    enum: [paymentType.DRUG, paymentType.OTHER],
    default: paymentType.DRUG,
  },
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
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
