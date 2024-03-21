const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const { sum } = require("lodash");
const expencesModel = require("../../expences/model/expences.model");
const otherServices = require("../model/other-services.model");
const treasurAmount = require("../../treasur/model/treasurAmount.model");

// get All type of Factories
exports.getAllOtherServices = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    };

    const allServices = await otherServices.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "creationBy",
          foreignField: "_id",
          as: "creationBy",
        },
      },
      { $unwind: "$creationBy" },
      {
        $match: matchQuery,
      },
    ]);

    const totalServices = sum(allServices.map((service) => service.amount));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all Service",
      data: allServices,
      totalServices: totalServices,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getOtherServiceById = async (req, res) => {
  try {
    const objService = await otherServices
      .findById(req.params.id)
      .populate("doctorId");
    if (!objService) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "service not Result",
        data: objService,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objService,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Payment Sale
exports.createOtherService = async (req, res, next) => {
  const body = req.body;
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
    body["creationBy"] = req.userId;
    await otherServices.create(body).then(async (result) => {
      const objExpences = new expencesModel({
        typeExpences: "otherService",
        otherServiceId: result._id,
        amount: body.amount,
        cashDate: body.date,
      });
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount -= body.amount;
      await objTreasurAmount.save();
      await objExpences.save();
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Created Expence successfully",
    });
  } catch (error) {
    res;
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create Expence",
      error: error.message,
    });
  }
};

// update Sale
exports.updateOtherService = async (req, res, next) => {
  const otherServiceId = req.params.id;
  const body = req.body;
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
    const objotherServices = await otherServices.findById(otherServiceId);
    if (!objotherServices) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Expence not found",
      });
    }
    body["creationBy"] = req.userId;
    const updateDocument = {
      $set: body,
    };
    await otherServices.updateOne({ _id: otherServiceId }, updateDocument);
    const objExpences = {
      typeExpences: "otherService",
      amount: body.amount,
      cashDate: body.date,
    };
    await expencesModel.updateOne(
      {
        otherServiceId: req.params.id,
      },
      {
        $set: objExpences,
      }
    );
    let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
    objTreasurAmount.amount += objotherServices.amount;
    objTreasurAmount.amount -= body.amount;
    await objTreasurAmount.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "Update Expence successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Sale
exports.deleteOtherService = async (req, res) => {
  const otherServiceId = req.params.id;
  try {
    const objotherServices = await otherServices.findById(otherServiceId);
    if (!objotherServices) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Expence not found",
      });
    }

    await otherServices.deleteOne({ _id: req.params.id });
    await expencesModel.deleteOne({
      otherServiceId: req.params.id,
    });
    let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
    objTreasurAmount.amount += objotherServices.amount;
    await objTreasurAmount.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Expence successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
