const mongoose = require("mongoose");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");
const ourRequestSchema = new mongoose.Schema({
  itemFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemsFactory",
    required: true,
  },
  orderStatus: {
    type: String,
    enum: [OrderStatus.PENDDING, OrderStatus.RECIVED],
    default: OrderStatus.PENDDING,
  },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number },
  wasPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  recevingDate: { type: Date },
  listOfMaterials: [
    {
      itemFactoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemsFactory", // Reference to another model (Item model)
        required: true,
      },
      unitsNumber: {
        type: Number,
        required: true,
      },
    },
  ],
});

const ourRequest = mongoose.model("OurRequest", ourRequestSchema);

module.exports = ourRequest;
