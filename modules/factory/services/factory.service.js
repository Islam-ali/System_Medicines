const FactoryModel = require("../model/factory.model");
const typeOfFactoryModel = require("../../typeOfFactory/model/typeOfFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");

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
    const existingFactory = await FactoryModel.findOne({ name: req.body.name });
    if (existingFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Factory already exists",
      });
    }
    const existingType = await typeOfFactoryModel.findOne({
      _id: req.body.typeOfFactoryId,
    });
    if (!existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist type of factory",
      });
    }
    await FactoryModel.create(req.body);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Factory successfully",
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
    const factories = await FactoryModel.find({
      typeOfFactoryId: req.params.typeOfFactoryId,
    });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: factories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a factory by ID
exports.updateFactory = async (req, res) => {
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
    let factoryToUpdate = await FactoryModel.findOne({ _id: req.params.id });
    if (!factoryToUpdate) {
      return res
        .status(404)
        .json({
          message: "Factory not found",
          data: [],
        });
    }

    factoryToUpdate.name = req.body.name || factoryToUpdate.name;
    factoryToUpdate.typeOfFactoryId =
      req.body.typeOfFactoryId || factoryToUpdate.typeOfFactoryId;

    await factoryToUpdate.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Factory successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deleteFactory = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await FactoryModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Factory",
      });
    }
    await FactoryModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Factory successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
