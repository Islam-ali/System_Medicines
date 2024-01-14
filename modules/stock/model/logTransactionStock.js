const mongoose = require("mongoose");
const logTransactionStockSchema  = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  logStatus: {type : String},
  pharmacyPrice: { type: Number , required: true },
  totalpharmacyPrice: { type: Number , required: true}, // unitsNumber * pharmacyPrice
  publicPrice: { type: Number , required: true },
  date: { type: Date , required: true},
  unitsNumber: { type: Number, required: true },
  netProfit: { type: Number , required: true},
  totalNetProfit: { type: Number , required: true},
});

const logTransactionStock = mongoose.model("logTransactionStock", logTransactionStockSchema);

module.exports = logTransactionStock;
