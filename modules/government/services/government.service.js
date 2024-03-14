const governmentModel = require("../model/government.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const city = require("../../city/model/city.model");

// get All type of Factories
exports.getAllGovernment = async (req, res, next) => {
  try {
    const allGovernment = await governmentModel.find({});
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allGovernment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getGovernmentById = async (req, res) => {
  try {
    const objGovernment = await governmentModel.findOne({
      _id: req.params.id,
    });
    if (!objGovernment) {
      return res
        .status(404)
        .json({
          statusCode: res.statusCode,
          message: "Government not found",
          data: objGovernment,
        });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objGovernment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Government
exports.createGovernment = async (req, res, next) => {
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
    const existingGovernment = await governmentModel.findOne({
      name: req.body.name,
    });
    if (existingGovernment) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    const newGovernment = new governmentModel(req.body);
    await newGovernment.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created Government successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update Government
exports.updateGovernment = async (req, res, next) => {
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
    const exist = await governmentModel.findOne({
      _id: req.params.id,
    });
    if (!exist) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Government",
      });
    }
    const filterexist = { name: req.body.name, _id: { $ne: req.params.id } };
    const existingname = await governmentModel.findOne(filterexist);
    if (existingname) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }
    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: req.body,
    };
    await governmentModel.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated Government successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Government
exports.deleteGovernment = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objGovernment = await governmentModel.findOne(filter);
    if (!objGovernment) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Government",
      });
    }
    const listOfCities = await city.find({ governmentId: objGovernment._id });
    if (listOfCities.length > 0) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "deleted Faild",
        data: listOfCities,
      });
    }
    await governmentModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Government successfully",
      data: listOfCities,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
