const mongoose = require("mongoose");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");
const ourRequestSchema = new mongoose.Schema({
  itemFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemsFactory",
    required: true,
  },
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Factory",
    required: true,
  },
  orderStatus: {
    type: String,
    enum: [OrderStatus.PENDDING, OrderStatus.RECIVED],
    default: OrderStatus.PENDDING,
  },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  itemName: { type: String, required: true },
  code: { type: String, required: true, uniqe: true },

  totalcost: { type: Number },
  wasPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  recevingDate: { type: Date },
  listOfMaterials: [
    {
      typeOfFactoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "typeOfFactory",
      },
      factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Factory",
      },
      itemFactoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemsFactory",
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
