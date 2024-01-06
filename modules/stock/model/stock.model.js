const mongoose = require("mongoose");
const stockSchema = new mongoose.Schema({
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
    required: true,
  },
  itemFactoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemsFactory",
    required: true,
  },
  classificationId: { type: Number, required: true },
  itemName: { type: String, required: true },
  typeofFactory: { type: String, required: true },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number, required: true },
  patchNumber: { type: String },
  manfDate: { type: Date },
  expDate: { type: Date },
});

const stock = mongoose.model("Stock", stockSchema);

module.exports = stock;
