const debtorPrivate = require("../model/debtorPrivate.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { sum } = require("lodash");
const debtorPrivateModel = require("../model/debtorPrivate.model");


// Create a new debtorPrivate
exports.createdebtorPrivate = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();

  var body = Object.assign({}, req.body);
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

    await debtorPrivateModel.create(body);
 
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create debtor For Factory successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// get All debtor For Factories
exports.getAlldebtorPrivate = async (req, res) => {
  try {
    const debtorPrivate = await debtorPrivateModel.find();
    const totaldebtorPrivate = sum(debtorPrivate.map((x)=> x.amount))
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totaldebtorPrivate: totaldebtorPrivate,
        listOfdebtorPrivate: debtorPrivate.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a factory by ID
exports.updatedebtorPrivate = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
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
    const objdebtorPrivate = await debtorPrivateModel.findOne({
      _id: req.params.id,
    });

    if (!objdebtorPrivate) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist debtor",
      });
    }

    objdebtorPrivate.title = req.body.title;
    objdebtorPrivate.amount = req.body.amount;
    objdebtorPrivate.date = req.body.date;
    objdebtorPrivate.note = req.body.note;

    await objdebtorPrivate.save()

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Updated debtor successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deletedebtorPrivate = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filterdebtorPrivateId = { _id: req.params.id };
    const objdebtorPrivate = await debtorPrivate.findOne(
      filterdebtorPrivateId
    )
    if (!objdebtorPrivate) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found debtor",
      });
    }

    await debtorPrivate.deleteOne(filterdebtorPrivateId);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted debtor successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
