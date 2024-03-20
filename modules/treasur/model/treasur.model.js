const mongoose = require("mongoose");

const treasurSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: Date, required: true , default: new Date() },
  amount: { type: Number, required: true },
  creationBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const treasur = mongoose.model("treasur", treasurSchema);

module.exports = treasur;
