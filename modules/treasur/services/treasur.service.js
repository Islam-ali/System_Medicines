const { sum } = require("lodash");
const expences = require("../../expences/model/expences.model");
const paymentClient = require("../../paymentClient/model/paymentClient.model");
const treasurModel = require("../model/treasur.model");
const treasurAmount = require("../model/treasurAmount.model");
const mongoose = require("mongoose");

// get All type of Factories
exports.getAllTreasur = async (req, res, next) => {
  try {
    const allTreasur = await treasurModel.find({});
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allTreasur,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
// create Treasur
exports.createTreasur = async (req, res, next) => {
  try {
    let body = req.body;
    body["creationBy"] = req.userId;
    const newTreasur = new treasurModel(body);
    await newTreasur.save().then(async (result) => {
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount += body.amount;
      await objTreasurAmount.save();
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update Treasur
exports.updateTreasur = async (req, res, next) => {
  try {
    const exist = await treasurModel.findOne({
      _id: req.params.id,
    });
    if (!exist) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Treasur",
      });
    }
    let body = req.body;
    body["creationBy"] = req.userId;
    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: body,
    };
    await treasurModel
      .updateOne(filter, updateDocument)
      .then(async (result) => {
        let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
        objTreasurAmount.amount -= exist.amount;

        objTreasurAmount.amount += body.amount;
        await objTreasurAmount.save();
      });
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated Treasur successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Treasur
exports.deleteTreasur = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existing = await treasurModel.findOne(filter);
    if (!existing) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Treasur",
      });
    }
    await treasurModel.deleteOne(filter).then(async (result) => {
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount -= existing.amount;
      await objTreasurAmount.save();
    });
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Treasur successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getTotalTreasur = async (req, res) => {
  try {
    const allTreasur = await treasurModel.find();
    const allExpences = await expences.find();
    const allIncomes = await paymentClient.find();

    const totalExpences = sum(allExpences.map((expence) => expence.amount));
    const totalIncomes = sum(allIncomes.map((income) => income.amount));
    const totalTreasur = sum(allTreasur.map((treasur) => treasur.amount));

    const mapObj = {
      totalExpences: totalExpences,
      totalIncomes: totalIncomes,
      totalTreasur: totalTreasur,
      total: totalTreasur + totalIncomes - totalExpences,
    };
    res.status(201).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: mapObj,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// exports.InsertTreasurAmount =  async (req, res) => {
//   try {

//   } catch (error) {
//     res
//       .status(500)
//       .json({ statusCode: res.statusCode, message: error.message });
//   }
// }
