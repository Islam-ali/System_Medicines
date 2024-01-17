const mongoose = require('mongoose');


const saleSchema = new mongoose.Schema({
  // name: { type: String, required: true, unique: true },
  // governmentId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'government',
  //   required: true,
  // },
  // governmentId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'government',
  //   required: true,
  // },
});


const sale = mongoose.model('sale', saleSchema);

module.exports = sale;