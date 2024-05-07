const FactoryModel = require("../model/factory.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const typeOfFactoryModel = require("../../typeOfFactory/model/typeOfFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const ourRequest = require("../../ourRequest/model/ourRequest.model");
const { sum } = require("lodash");
const PaymentForFactory = require("../../PaymentForFactories/model/paymentForFactories.model");
const mongoose = require("mongoose");
const paymentType = require("../../../core/enums/paymentType.enum");

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
    // const listOfPayment = await PaymentForFactory.find({
    //   factoryId: factory._id,
    // });
    // const totalWasPaid = sum(
    //   listOfPayment.map((payment) => payment.cashAmount)
    // );

    const date = new Date();
    const currentYear = date.getFullYear();
    const matchQuery = {
      factoryId: new mongoose.Types.ObjectId(factory._id),
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, currentYear] },
          { $ne: ["$paymentType", paymentType.OTHER] },
        ],
      },
    };
    const matchQuery2 = {
      factoryId: new mongoose.Types.ObjectId(factory._id),
      $expr: {
        $and: [
          { $ne: [{ $year: "$cashDate" }, currentYear] },
          { $ne: ["$paymentType", paymentType.OTHER] },
        ],
      },
    };
    const objPaymentType = {
      factoryId: new mongoose.Types.ObjectId(factory._id),
      paymentType: paymentType.OTHER,
    };
    const listOfPaymentForFactorysForOther = await PaymentForFactory.aggregate([
      {
        $match: objPaymentType,
      },
    ]);
    const listOfPaymentForFactorys = await PaymentForFactory.aggregate([
      {
        $match: matchQuery,
      },
    ]);

    const listOfPaymentForFactorys2 = await PaymentForFactory.aggregate([
      {
        $match: matchQuery2,
      },
    ]);
    // const listOfOurRequests = await ourRequest.aggregate([
    //   {
    //     $match: matchQuery,
    //   },
    // ]);

    // const listOfOurRequests2 = await ourRequest.aggregate([
    //   {
    //     $match: matchQuery2,
    //   },
    // ]);
    const listOfOurRequests = await ourRequest.find({ factoryId: factory._id });
    const totalOurRequest = sum(
      listOfOurRequests.map((ourRequest) => ourRequest.totalcost)
    );

    // const totalOurRequest2 = sum(
    //   listOfOurRequests2.map((ourRequest) => ourRequest.totalcost)
    // );

    const totalwasPaid = sum(
      listOfPaymentForFactorys.map((payment) => payment.cashAmount)
    );
    const totalwasPaid2 = sum(
      listOfPaymentForFactorys2.map((payment) => payment.cashAmount)
    );

    const totalForOther = sum(
      listOfPaymentForFactorysForOther.map((payment) => payment.cashAmount)
    );
    // const allOurRequest = totalOurRequest + totalOurRequest2;
    const allwasPaid = totalwasPaid + totalwasPaid2;

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        ...factory._doc,
        totalOurRequest: totalOurRequest,
        allwasPaid: allwasPaid,
        wasPaidInYear:totalwasPaid,
        carryOverBalance: totalOurRequest - totalwasPaid2,
        balance: totalOurRequest - allwasPaid,
        totalForOther: totalForOther,
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
