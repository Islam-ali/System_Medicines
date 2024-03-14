const mongoose = require("mongoose");
const expencesSchema = new mongoose.Schema({
  typeExpences: { type: String, required: true },
  paymentFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentForFactory",
    default: null
  },
  salaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "salaries",
    default: null
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "service",
    default: null
  },
  amount: { type: Number, required: true },
  cashDate: { type: Date, required: true },
});

const expences = mongoose.model("expences", expencesSchema);

module.exports = expences;
