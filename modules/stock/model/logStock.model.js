const mongoose = require("mongoose");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");

const logStockSchema = new mongoose.Schema({
  orderStatus: {
    type: String,
    enum: [OrderStatus.RECIVED, OrderStatus.RETURN],
    required: true,
  },
  itemName: { type: String, required: true },
  factoryName: { type: String, required: true },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number, required: true },
  insertDate: { type: Date, required: true },
});

const logStock = mongoose.model("logStock", logStockSchema);

module.exports = logStock;
