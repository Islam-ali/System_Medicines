const mongoose = require("mongoose");
const expencesSchema = new mongoose.Schema({
  typeExpences: { type: String, required: true },
  paymentFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentForFactory",
  },
  salaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "salaries",
  },
  amount: { type: Number, required: true },
  cashDate: { type: Date, required: true },
});

const expences = mongoose.model("expences", expencesSchema);

module.exports = expences;
