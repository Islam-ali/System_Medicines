const mongoose = require("mongoose");
const requestPrivateSchema = new mongoose.Schema({
  request: { type: String, required: true },
  date: { type: Date, required: true },
  note: { type: String },
});

const requestPrivate = mongoose.model("requestPrivate", requestPrivateSchema);

module.exports = requestPrivate;
