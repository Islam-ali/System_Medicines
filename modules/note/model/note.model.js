const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
});

const noteModel = mongoose.model("notes", noteSchema);

module.exports = noteModel ;
