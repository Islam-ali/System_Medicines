const mongoose = require("mongoose");
const clientTypeRole = require("../../../core/enums/clientType.enum");
const listtypeOfClient = [
  {name:'pharmacy' , id: clientTypeRole.PHARMACY},
  {name:'store' , id: clientTypeRole.STORE},
];
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  typeOfClient: {
    type: Object,
    validate: {
      validator: function(value) {
        return listtypeOfClient.some(client => client.id === value.id);
      },
      message: 'Invalid typeOfClient value',
    },
    required: true,
  },
  cityId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'city',
    required: true,
  },
});

const clientModel = mongoose.model("client", clientSchema);

module.exports = {clientModel , listtypeOfClient};
