const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const authPrivateModel = require("../model/authPrivate.model");

// Create a new authPrivate
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  try {
    const { password } = req.body;
    const objAuthPrivate = await authPrivateModel.findOne({
      password: password,
    });
    if (!objAuthPrivate) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Password Was Wrong",
      });
    }
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "Login Private successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
