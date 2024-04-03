const mongoose = require("mongoose");
const debtorPrivateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String },
});

const debtorPrivate = mongoose.model("debtorPrivate", debtorPrivateSchema);

module.exports = debtorPrivate;
