const mongoose = require("mongoose");

const wayOfPaymentSchema = new mongoose.Schema({
  name: { type: String, required: true, uniqe: true },
});

const wayOfPayment = mongoose.model("wayOfPayment", wayOfPaymentSchema);

module.exports = wayOfPayment;
