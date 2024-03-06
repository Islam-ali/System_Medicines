const mongoose = require("mongoose");
const StatusSubStock = require("../../../core/enums/StatusSubStock.enum");

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
  publicPrice: { type: Number, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: [StatusSubStock.INSTOCK, StatusSubStock.OUTOFSTOCK],
    default: StatusSubStock.INSTOCK,
  },
});

const branchStock = mongoose.model("branchStock", branchStockSchema);

module.exports = branchStock;
