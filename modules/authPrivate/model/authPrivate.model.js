const mongoose = require("mongoose");
const authPrivateSchema = new mongoose.Schema({
  password: { type: String, required: true },
});

const authPrivate = mongoose.model("authPrivate", authPrivateSchema);

module.exports = authPrivate;
