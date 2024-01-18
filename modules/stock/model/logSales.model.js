const mongoose = require("mongoose");
const logSalesSchema  = new mongoose.Schema({
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sale",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  salesValue: { type: Number , required: true },
  logStatus: {type : String},
  received: { type: Number, required: true },
  balance: { type: Number, required: true },
  publicPrice: { type: Number , required: true },
  date: { type: Date , required: true},
});

const logSales = mongoose.model("logSales", logSalesSchema);

module.exports = logSales;
