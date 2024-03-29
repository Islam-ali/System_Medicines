const mongoose = require('mongoose');


const typeOfFactorySchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  classificationId: {type:Number , required: true}
});


const typeOfFactory = mongoose.model('typeOfFactory', typeOfFactorySchema);

module.exports = typeOfFactory;