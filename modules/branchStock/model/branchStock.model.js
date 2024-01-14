const mongoose = require("mongoose");
const branchStockSchema = new mongoose.Schema({
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
  unitsNumber: { type: Number, required: true },
  pharmacyPrice: { type: Number , required: true },
  totalpharmacyPrice: { type: Number , required: true}, // unitsNumber * pharmacyPrice
  publicPrice: { type: Number , required: true },
  date: { type: Date , required: true},
});

const branchStock = mongoose.model("branchStock", branchStockSchema);

module.exports = branchStock;
