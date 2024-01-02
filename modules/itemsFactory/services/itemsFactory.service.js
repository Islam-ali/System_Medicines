const itemsFactory = require("../model/itemsFactory.model");
const factoryModel = require("../../factory/model/factory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");

// Create a new factory
exports.createItemsFactory = async (req, res) => {
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
    const existingFactory = await itemsFactory.findOne({ name: req.body.name });
    if (existingFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Item already exists",
      });
    }
    const existingType = await factoryModel.findOne({
      _id: req.body.factoryId,
    });
    if (!existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Factory",
      });
    }
    await itemsFactory.create(req.body);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all factories
exports.getAllItemsFactories = async (req, res) => {
  try {
    const factories = await itemsFactory.find().populate("factoryId");
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
exports.getItemsFactoryById = async (req, res) => {
  try {
    const factory = await itemsFactory
      .findById(req.params.id)
      .populate("factoryId");
    if (!factory) {
        
        return res.status(404).json({statusCode: res.statusCode, message: "Item not found"  });
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

// Get factories by factoryId
exports.getItemsFactoryByFactoryId = async (req, res) => {
  try {
    const itemFactory = await itemsFactory.find({
      factoryId: req.params.factoryId,
    });
    if (!itemFactory) {
      return res.status(404).json({statusCode: res.statusCode, message: "Item not found", data: [] });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: itemFactory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a factory by ID
exports.updateItemsFactory = async (req, res) => {
  const errors = validationResult(req);
  if (!req.params.id) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "ID Is Requierd"
    });
  }
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  try {
    let itemsFactoryToUpdate = await itemsFactory.findOne({
      _id: req.params.id,
    });
    if (!itemsFactoryToUpdate) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Items not found",
        data: [],
      });
    }

    itemsFactoryToUpdate.name = req.body.name || itemsFactoryToUpdate.name;
    itemsFactoryToUpdate.factoryId =
      req.body.factoryId || itemsFactoryToUpdate.factoryId;

    await itemsFactoryToUpdate.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deleteItemsFactory = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await itemsFactory.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }
    await itemsFactory.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
