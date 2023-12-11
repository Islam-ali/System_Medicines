const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require("process");

// Register
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res
      .status(400)
      .json({
        statusCode: res.statusCode,
        message: "invalid Error",
        errors: convArray.errorForm(),
      });
  }
  const { username, password, email, phoneNumber , role } = req.body;
  try {
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }, { phoneNumber }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          statusCode: res.statusCode,
          message: "Username or email or phoneNumber already exists",
        });
    }
    const newUser = new userModel({ username, password, email, phoneNumber ,role});
    await newUser.save();
    res
      .status(201)
      .json({
        statusCode: res.statusCode,
        message: "User registered successfully"
      });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());

    return res.status(400).json({ errors: convArray.errorForm() });
  }
  const { username, password } = req.body;
  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Create JWT token
    const token = jwt.sign({ userId: user._id , username: user.username , role: user.role }, env.JWT_SECRET , {
      expiresIn: "1d",
    });
    res
      .status(200)
      .json({
        statusCode: res.statusCode,
        message: "User login successfully",
        token: token,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
