const mongoose = require("mongoose");
  const OrderState = require("../../../core/enums/orderState.enum");
const ourRequestSchema = new mongoose.Schema({
  itemFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemsFactory",
    required: true,
  },
  orderState: { type: String, enum: [OrderState.PENDDING, OrderState.RECIVED], default: OrderState.PENDDING },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number },
  wasPaid: { type: Number },
  recevingDate: { type: Date },
  listOfMaterials: [
    {
      itemFactoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemsFactory', // Reference to another model (Item model)
        required: true
      },
      unitsNumber: {
        type: Number,
        required: true
      },
    },
  ],
});

const ourRequest = mongoose.model("OurRequest", ourRequestSchema);

module.exports = ourRequest;
