const mongoose = require("mongoose");
const mapLocationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
  SerialNumber: { type: String },
  IMEI: { type: String },
  string: { type: String },
  Number: { type: Number },
  Date: { type: Date },
});

const mapLocation = mongoose.model("MapLocation", mapLocationSchema);

module.exports = mapLocation;
