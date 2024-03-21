const mongoose = require("mongoose");

const treasurAmountSchema = new mongoose.Schema({
  amount: { type: Number, required: true , default:0 },
  id: {type:Number , required: true , default:0}
});

const treasurAmount = mongoose.model("treasurAmount", treasurAmountSchema);

module.exports = treasurAmount;
