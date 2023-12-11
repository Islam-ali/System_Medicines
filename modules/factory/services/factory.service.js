const FactoryModel = require("../model/factory.model");
const typeOfFactoryModel = require("../../typeOfFactory/model/typeOfFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require('express-validator');


// Create a new factory
exports.createFactory = async (req, res) => {
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
    const existingType = await typeOfFactoryModel.findOne({ _id:req.body.typeOfFactoryId });
    if (!existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist type of factory",
      });
    }
    const newFactory = await FactoryModel.create(req.body);
    res
    .status(201)
    .json({
      statusCode: res.statusCode,
      message: "create Factory successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all factories
exports.getAllFactories = async (req, res) => {
  try {
    const factories = await FactoryModel.find().populate("typeOfFactoryId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: factories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific factory by ID
exports.getFactoryById = async (req, res) => {
  try {
    const factory = await FactoryModel.findById(req.params.id).populate(
      "typeOfFactoryId"
    );
    if (!factory) {
      return res.status(404).json({ message: "Factory not found" });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: factory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get factories by TypeOfFactoryId
exports.getFactoriesByTypeOfFactoryId = async (req, res) => {
  try {
    const factories = await FactoryModel.find({ typeOfFactoryId: req.params.typeOfFactoryId });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: factories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Update a factory by ID
exports.updateFactory = async (req, res) => {
  try {
    const updatedFactory = await FactoryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("typeOfFactoryId");
    if (!updatedFactory) {
      return res.status(404).json({ message: "Factory not found" });
    }
    res
      .status(201)
      .json({
        statusCode: res.statusCode,
        message: "update Factory successfully"
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deleteFactory = async (req, res) => {
  try {
    const deletedFactory = await FactoryModel.findByIdAndDelete(req.params.id);
    if (!deletedFactory) {
      return res.status(404).json({ message: "Factory not found" });
    }
    res
      .status(201)
      .json({
        statusCode: res.statusCode,
        message: "delete Factory successfully"
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
