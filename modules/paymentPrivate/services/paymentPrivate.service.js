const PaymentPrivate = require("../model/paymentPrivate.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const expencesModel = require("../../expences/model/expences.model");
const { sum } = require("lodash");
const Factory = require("../../factory/model/factory.model");
const treasurAmount = require("../../treasur/model/treasurAmount.model");
const PaymentPrivateModel = require("../model/paymentPrivate.model");


// Create a new PaymentPrivate
exports.createPaymentPrivate = async (req, res) => {
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

    await PaymentPrivateModel.create(body);
 
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Payment For Factory successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// get All Payment For Factories
exports.getAllPaymentPrivate = async (req, res) => {
  try {
    // const year = new Date(queryDate).getFullYear();
    let query = {}; // Months are zero-based, so add 1
    // const matchQuery = {
    //   $expr: {
    //     $and: [
    //       { $eq: [{ $year: "$cashDate" }, year] },
    //       // { $eq: [{ $month: "$cashDate" }, month] },
    //     ],
    //   },
    // };
    const PaymentPrivate = await PaymentPrivateModel.find();

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: PaymentPrivate.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a factory by ID
exports.updatePaymentPrivate = async (req, res) => {
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
    const objPaymentPrivate = await PaymentPrivateModel.findOne({
      _id: req.params.id,
    });

    if (!objPaymentPrivate) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Payment",
      });
    }

    objPaymentPrivate.title = req.body.title;
    objPaymentPrivate.amount = req.body.amount;
    objPaymentPrivate.date = req.body.date;
    objPaymentPrivate.note = req.body.note;

    await objPaymentPrivate.save()

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Updated Payment successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deletePaymentPrivate = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filterPaymentPrivateId = { _id: req.params.id };
    const objPaymentPrivate = await PaymentPrivate.findOne(
      filterPaymentPrivateId
    )
    if (!objPaymentPrivate) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found payment",
      });
    }

    await PaymentPrivate.deleteOne(filterPaymentPrivateId);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Payment successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
