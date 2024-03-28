const FactoryModel = require("../model/factory.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const typeOfFactoryModel = require("../../typeOfFactory/model/typeOfFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const ourRequest = require("../../ourRequest/model/ourRequest.model");
const { sum } = require("lodash");
const PaymentForFactory = require("../../PaymentForFactories/model/paymentForFactories.model");

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

    const listOfOurRequests = await ourRequest.find({ factoryId: factory._id });
    const totalOurRequest = sum(
      listOfOurRequests.map((ourRequest) => ourRequest.totalcost)
    );

    const listOfPayment = await PaymentForFactory.find({
      factoryId: factory._id,
    });
    const totalWasPaid = sum(
      listOfPayment.map((payment) => payment.cashAmount)
    );
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        ...factory._doc,
        totalOurRequest: totalOurRequest,
        totalWasPaid: totalWasPaid,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get factories by TypeOfFactoryId
exports.getFactoriesByTypeOfFactoryId = async (req, res) => {
  const existingType = await typeOfFactoryModel.findOne({
    _id: req.params.typeOfFactoryId,
  });
  if (!existingType) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "not exist type of factory",
    });
  }
  try {
    const factories = await FactoryModel.find({
      typeOfFactoryId: req.params.typeOfFactoryId,
    });
    const objTypeOfFactory = await typeOfFactoryModel.findOne({
      _id: req.params.typeOfFactoryId,
    });
    const objmapResponse = {
      typeOfFactoryName: objTypeOfFactory.type,
      listOfFactories: factories,
    };
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objmapResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFactoriesByClassificationId = async (req, res) => {
  try {
    const listOfFactoy = await FactoryModel.find().populate({
      path: "typeOfFactoryId",
      match: { classificationId: req.params.classificationId },
    });

    if (!listOfFactoy) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Item not found",
        data: [],
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfFactoy,
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
      return res.status(404).json({
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
    const itemFactory = await itemsFactoryModel.find({
      factoryId: req.params.id,
    });
    if (itemFactory.length > 0) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "can't deleted",
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
