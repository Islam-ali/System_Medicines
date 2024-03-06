const mongoose = require('mongoose');


const serviceSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctors",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  note: { type: String },
});


const service = mongoose.model("service", serviceSchema);

module.exports = service;