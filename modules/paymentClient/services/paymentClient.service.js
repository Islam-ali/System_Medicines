const paymentClientModel = require("../model/paymentClient.model");
const logClientModel = require("../../log-client/model/log-client.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const UserRole = require("../../../core/enums/role.enum");
const methodTypeEnum = require("../../../core/enums/methoType.enum");
const typeLogClientEnum = require("../../../core/enums/typeLogClient.enum");
const mongoose = require("mongoose");
const { clientModel } = require("../../client/model/client.model");

// get All type of Factories
exports.getAllPaymentClient = async (req, res, next) => {
  const userId = req.userId;
  const clientId = req.query.clientId;
  const isAllow = req.roleName == UserRole.ADMIN;
  let query = {};
  let matchSale = {};
  if (!isAllow) {
    query["recipientId"] = new mongoose.Types.ObjectId(userId);
  }
  clientId
    ? (matchSale["clientId"] = new mongoose.Types.ObjectId(clientId))
    : null;
  try {
    const allPaymentClient = await paymentClientModel.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientId",
        },
      },
      { $unwind: "$recipientId" },
      {
        $match: { $and: [matchSale, query] },
      },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allPaymentClient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getPaymentClientById = async (req, res) => {
  try {
    const objPaymentClient = await paymentClientModel
      .find({
        _id: req.params.paymentClientId,
      })
      .populate("clientId")
      .populate("recipientId");
    if (!objPaymentClient) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "payment not Result",
        data: objPaymentClient,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objPaymentClient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Payment Sale
exports.createPaymentClient = async (req, res, next) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  const body = req.body;
  const userId = !body.userId ? req.userId : body.userId;
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
    const newPaymentClient = new paymentClientModel({
      clientId: body.clientId,
      recipientId: userId,
      date: body.date,
      amount: body.amount,
      note: body.note,
    });

    await Promise.all([newPaymentClient.save()]).then(async (result) => {
      const objClient = await clientModel.findOne({ _id: body.clientId });
      objClient.wasPaid += body.amount;
      await objClient.save();
      const objLogClient = {
        clientId: result[0].clientId,
        paymentClientId: result[0]._id,
        creationBy: req.userId,
        beforUpdatePaymentClient: null,
        afterUpdatePaymentClient: result[0]._doc,
        type: typeLogClientEnum.PAYMENT,
        methodName: methodTypeEnum.CREATE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "Created payment successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// update Sale
exports.updatePaymentClient = async (req, res, next) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  const paymentClientId = req.params.id;
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
    const objpaymentClientModel = await paymentClientModel.findById(
      paymentClientId
    );
    if (!objpaymentClientModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "payment not found",
      });
    }
    const CopyObjPaymentClient = JSON.parse(
      JSON.stringify(objpaymentClientModel)
    );

    objpaymentClientModel.clientId = body.clientId;
    objpaymentClientModel.recipientId = body.recipientId;
    objpaymentClientModel.date = body.date;
    objpaymentClientModel.amount = body.amount;
    objpaymentClientModel.note = body.note;
    await Promise.all([objpaymentClientModel.save()]).then(async (result) => {
      const oldObjClient = await clientModel.findOne({
        _id: CopyObjPaymentClient.clientId,
      });
      oldObjClient.wasPaid -= CopyObjPaymentClient.amount;
      await oldObjClient.save();

      const objClient = await clientModel.findOne({ _id: body.clientId });
      objClient.wasPaid += body.amount;
      await objClient.save();

      const objLogClient = {
        clientId: result[0].clientId,
        paymentClientId: result[0]._id,
        creationBy: req.userId,
        beforUpdatePaymentClient: CopyObjPaymentClient,
        afterUpdatePaymentClient: result[0]._doc,
        type: typeLogClientEnum.PAYMENT,
        methodName: methodTypeEnum.UPDATE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "Update Sale successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Sale
exports.deletePaymentClient = async (req, res) => {
  const paymentClientId = req.params.id;
  try {
    const objpaymentClientModel = await paymentClientModel.findById(
      paymentClientId
    );
    if (!objpaymentClientModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "payment not found",
      });
    }
    await Promise.all([
      paymentClientModel.deleteOne({ _id: paymentClientId }),
    ]).then(async (result) => {
      const oldObjClient = await clientModel.findOne({
        _id: objpaymentClientModel.clientId,
      });
      oldObjClient.wasPaid -= objpaymentClientModel.amount;
      oldObjClient.save();
      const objLogClient = {
        clientId: objpaymentClientModel.clientId,
        paymentClientId: result[0]._id,
        creationBy: req.userId,
        beforUpdatePaymentClient: objpaymentClientModel,
        afterUpdatePaymentClient: result[0]._doc,
        type: typeLogClientEnum.PAYMENT,
        methodName: methodTypeEnum.DELETE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted payment successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: res.statusCode,
      message: error.message,
    });
  }
};
