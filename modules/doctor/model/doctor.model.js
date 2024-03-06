const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  specialist: { type: String },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "city",
  },
});

const doctorModel = mongoose.model("doctors", doctorSchema);

module.exports = doctorModel ;
