const mongoose = require("mongoose");
const stockSchema = new mongoose.Schema({
  ourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OurRequest",
    required: true,
  },
  itemName: { type: String, required: true },
  typeofFactory: { type: String, required: true },
  unitsNumber: { type: Number, required: true },
  unitsCost: { type: Number, required: true },
  totalcost: { type: Number, required: true },
});

const stock = mongoose.model("Stock", stockSchema);

module.exports = stock;
