const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserRole = require('../../../core/enums/role.enum');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    // required: true,
  },
});


// Hash user password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model('users', userSchema);

module.exports = User;