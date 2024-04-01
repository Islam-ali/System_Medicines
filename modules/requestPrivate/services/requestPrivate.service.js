const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const RequestPrivateModel = require("../model/requestPrivate.model");


// Create a new RequestPrivate
exports.createRequestPrivate = async (req, res) => {
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

    await RequestPrivateModel.create(body);
 
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
exports.getAllRequestPrivate = async (req, res) => {
  try {
    const RequestPrivate = await RequestPrivateModel.find();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        listOfRequestPrivate: RequestPrivate.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a factory by ID
exports.updateRequestPrivate = async (req, res) => {
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
    const objRequestPrivate = await RequestPrivateModel.findOne({
      _id: req.params.id,
    });

    if (!objRequestPrivate) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Payment",
      });
    }

    objRequestPrivate.request = req.body.request;
    objRequestPrivate.date = req.body.date;
    objRequestPrivate.note = req.body.note;

    await objRequestPrivate.save()

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
exports.deleteRequestPrivate = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filterRequestPrivateId = { _id: req.params.id };
    const objRequestPrivate = await RequestPrivateModel.findOne(
      filterRequestPrivateId
    );
    if (!objRequestPrivate) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found payment",
      });
    }

    await RequestPrivateModel.deleteOne(filterRequestPrivateId);

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
