const mongoose = require("mongoose");

const ourRequestSchema = new mongoose.Schema({
  itemFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemsFactory",
    required: true,
  },
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
