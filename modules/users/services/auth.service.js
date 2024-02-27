const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("process");

// Register
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  const { username, password, email, phoneNumber, roleId } = req.body;
  try {
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Username or email or phoneNumber already exists",
      });
    }
    const newUser = new userModel({
      username,
      password,
      email,
      phoneNumber,
      roleId,
    });
    await newUser.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "User registered successfully",
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
    return res.status(400).json({ message: "Invalid Data" ,errors: convArray.errorForm() });
  }
  try {
    const { username, password } = req.body;
    let objError = {};
    const user = await userModel.findOne({ username }).populate("roleId");
    if (!user) {
      objError = { username: ["username is Wrong"] };
      return res.status(400).json({ message: "Invalid Data", errors: objError });
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      objError = { password: ["password is Wrong"] };
      return res.status(400).json({ message: "Invalid Data", errors: objError });
    }
    // Create JWT token
    const expiresInOneYear = 365 * 24 * 60 * 60;
    const payload = {
      userId: user._id, roleName: user.roleId.name , permissions: user.roleId.permissions.filter(permission => permission.isSelected).map(permission => permission.permission)
    };
    const token = jwt.sign(
      payload,
      env.JWT_SECRET,{ algorithm: 'HS256' },
      {
        expiresIn: expiresInOneYear,
      }
    );
    res.status(200).json({
      statusCode: res.statusCode,
      message: "Login successfully",
      data: { token: token },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific User by ID
exports.getUserById = async (req, res) => {
  try {
    const User = await userModel.findById(req.params.id).populate("roleId");
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: User,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate("roleId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a User by ID
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  const { username, email, phoneNumber, roleId, password } = req.body;
  try {
    const UserToUpdate = await userModel.findOne({ _id: req.params.id });
    if (!UserToUpdate) {
      return res
        .status(404)
        .json({
          message: "User not found",
          data: [],
        });
    }
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }, { phoneNumber }],
      _id: { $ne: req.params.id }
    });
    if (existingUser) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Username or email or phoneNumber already exists",
      });
    }
    UserToUpdate.username = username
    UserToUpdate.email = email
    UserToUpdate.phoneNumber = phoneNumber
    UserToUpdate.roleId = roleId
    UserToUpdate.password = password;

    await UserToUpdate.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update User successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Type Of Factory
exports.changeStatus = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objUserModel = await userModel.findOne(filter);
    if (!objUserModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found User",
      });
    }

    objUserModel["active"] = !objUserModel["active"];
    
    await objUserModel.save();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "change Active User successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
