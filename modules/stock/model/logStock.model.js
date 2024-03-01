const mongoose = require("mongoose");
const logStockSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stock",
    required: true,
  },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number, required: true },
  insertDate: { type: Date, required: true },
});

const logStock = mongoose.model("logStock", logStockSchema);

module.exports = logStock;
