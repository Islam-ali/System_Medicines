const mongoose = require("mongoose");

const otherServicesSchema = new mongoose.Schema({
  description: { type: String, required: true },
  creationBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  note: { type: String },
});

const otherServices = mongoose.model("otherServices", otherServicesSchema);

module.exports = otherServices;
