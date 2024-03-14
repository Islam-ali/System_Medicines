const mongoose = require("mongoose");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");

const logTransferSchema = new mongoose.Schema({
  orderStatus: {
    type: String,
    enum: [OrderStatus.SENT, OrderStatus.RETURN],
    required: true,
  },
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
  totalcost: { type: Number, required: true },
  insertDate: { type: Date, required: true },
});

const logTransfer = mongoose.model("logTransfer", logTransferSchema);

module.exports = logTransfer;
