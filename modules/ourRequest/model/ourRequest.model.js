const mongoose = require("mongoose");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");
const orderType = require("../../../core/enums/orderType.enum");
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
    enum: [OrderStatus.PENDDING, OrderStatus.RECIVED, OrderStatus.RETURN],
    default: OrderStatus.PENDDING,
  },
  orderType: {
    type: String,
    enum: [orderType.GOODS, orderType.SAMPLE],
    default: orderType.GOODS,
  },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  // itemName: { type: String, required: true },
  code: { type: Number, required: true, uniqe: true },
  totalcost: { type: Number },
  wasPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  recevingDate: { type: Date },
  patchNumber: { type: Number },
  manfDate: { type: Date },
  expDate: { type: Date },
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
        ref: "stocks",
      },
      unitsNumber: {
        type: Number,
        required: true,
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
});

const ourRequest = mongoose.model("OurRequest", ourRequestSchema);

module.exports = ourRequest;
