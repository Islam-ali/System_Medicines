const mongoose = require('mongoose');


const salariesSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: { type: Date , required: true},
  amount: { type: Number , required: true},
  note: { type: String },
});


const salaries = mongoose.model("salaries", salariesSchema);

module.exports = salaries;