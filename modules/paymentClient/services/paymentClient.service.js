const paymentClientModel = require("../model/paymentClient.model");
const logClientModel = require("../../log-client/model/log-client.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const UserRole = require("../../../core/enums/role.enum");
const methodTypeEnum = require("../../../core/enums/methoType.enum");
const typeLogClientEnum = require("../../../core/enums/typeLogClient.enum");
const mongoose = require("mongoose");
const { clientModel } = require("../../client/model/client.model");
const treasurAmount = require("../../treasur/model/treasurAmount.model");
const { sum } = require("lodash");
const sale = require("../../sale/model/sale.model");

// get All type of Factories
exports.getAllPaymentClient = async (req, res, next) => {
  const userId = req.userId;
  const clientId = req.query.clientId;
  const isAllow = req.roleName == UserRole.ADMIN;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const date = new Date();
  const currentYear = date.getFullYear();
  const previousYear = currentYear - 1;
  let query = {};
  let matchSale = {};
  // if (!isAllow) {
  //   query["recipientId"] = new mongoose.Types.ObjectId(userId);
  // }
  if (fromDate && toDate) {
    query.date = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }
  //  else {
  //   query = {
  //     $expr: {
  //       $and: [{ $eq: [{ $year: "$date" }, currentYear] }],
  //     },
  //   };
  // }
  if (clientId) {
    matchSale["clientId._id"] = new mongoose.Types.ObjectId(clientId);
  }
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

    const totalWasPaid = sum(allPaymentClient.map((payment) => payment.amount));
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        allpayment: allPaymentClient.reverse(),
        totalWasPaid: totalWasPaid,
      },
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
  const userId = !body.recipientId ? req.userId : body.recipientId;
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
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount += body.amount;
      await objTreasurAmount.save();
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
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount -= CopyObjPaymentClient.amount;
      objTreasurAmount.amount += body.amount;
      await objTreasurAmount.save();
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
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount -= objpaymentClientModel.amount;
      await objTreasurAmount.save();
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

// get All type of Factories
exports.getAllTotalPaymentAndSalesForClient = async (req, res, next) => {
  try {
    const date = new Date();
    const currentYear = date.getFullYear();
    const matchQuery = {
      $expr: {
        $and: [{ $eq: [{ $year: "$date" }, currentYear] }],
      },
    };
    const matchQuery2 = {
      $expr: {
        $and: [{ $ne: [{ $year: "$date" }, currentYear] }],
      },
    };
    const listOfSales = await sale.aggregate([
      {
        $match: matchQuery,
      },
    ]);
    const listOfPaymentClient = await paymentClientModel.aggregate([
      {
        $match: matchQuery,
      },
    ]);

    const listOfSales2 = await sale.aggregate([
      {
        $match: matchQuery2,
      },
    ]);
    const listOfPaymentClient2 = await paymentClientModel.aggregate([
      {
        $match: matchQuery2,
      },
    ]);

    const totalSalesValue = sum(listOfSales.map((sale) => sale.salesValue));
    const totalwasPaid = sum(listOfPaymentClient.map((payment) => payment.amount));

    const totalSalesValue2 = sum(listOfSales2.map((sale) => sale.salesValue));
    const totalwasPaid2 = sum(listOfPaymentClient2.map((payment) => payment.amount));

    const allSalesValue = totalSalesValue + totalSalesValue2;
    const allwasPaid = totalwasPaid + totalwasPaid2;

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalSalesValue: totalSalesValue,
        totalwasPaid: totalwasPaid,
        totalSalesValue2: totalSalesValue2,
        totalwasPaid2: totalwasPaid2,
        balanceRelay: totalSalesValue2 - totalwasPaid2,
        balance: allSalesValue - allwasPaid,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
