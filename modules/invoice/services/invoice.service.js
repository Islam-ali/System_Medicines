const paymentSaleModel = require("../model/paymentSale.model");
const saleModel = require("../../sale/model/sale.model");
const logClientModel = require("../../log-client/model/log-client.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const UserRole = require("../../../core/enums/role.enum");
const methodTypeEnum = require("../../../core/enums/methoType.enum");
const typeLogClientEnum = require("../../../core/enums/typeLogClient.enum");
const mongoose = require("mongoose");

// get All type of Factories
exports.getAllInvoice = async (req, res, next) => {
  const userId = req.userId;
  const clientId = req.query.clientId;
  const saleId = req.query.saleId;
  const isAllow = req.roleName == UserRole.ADMIN;
  let query = {};
  let matchSale = {};
  if (!isAllow) {
    query["saleId.userId"] = new mongoose.Types.ObjectId(userId);
  }
  if (saleId) {
    query["saleId._id"] = new mongoose.Types.ObjectId(saleId);
  }
  clientId
    ? (matchSale["saleId.clientId"] = new mongoose.Types.ObjectId(clientId))
    : null;
  try {
    const allPaymentSale = await paymentSaleModel.aggregate([
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleId",
        },
      },
      { $unwind: "$saleId" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleId.branchStockId",
          foreignField: "_id",
          as: "saleId.branchStockId", // This is the additional lookup
        },
      },
      { $unwind: "$saleId.branchStockId" }, // Unwind the new field
      {
        $lookup: {
          from: "stocks",
          localField: "saleId.branchStockId.stockId",
          foreignField: "_id",
          as: "saleId.branchStockId.stockId",
        },
      },
      { $unwind: "$saleId.branchStockId.stockId" },
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
    // .find(query)
    // .populate({
    //   path: "saleId",
    //   // match: matchSale,
    //   populate: {
    //     path: "branchStockId",
    //     model: "branchStock",
    //     populate: {
    //       path: "stockId",
    //       model: "Stock",
    //     },
    //   },
    // })
    // .populate({
    //   path: "recipientId",
    //   model: "users",
    //   select: "-password -roleId",
    // });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allPaymentSale,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const listOfPaymentSale = await paymentSaleModel
      .find({
        governmentId: req.params.governmentId,
      })
      .populate("governmentId");
    if (!listOfPaymentSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Government not Result",
        data: listOfPaymentSale,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfPaymentSale,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Payment Sale
exports.createInvoice = async (req, res, next) => {
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
    // update sale
    const objSale = await saleModel.findOne({ _id: body.saleId }).populate({
      path: "branchStockId",
      model: "branchStock",
      populate: {
        path: "stockId",
        model: "Stock",
      },
    });

    objSale.received += body.amount;
    objSale.balance = objSale.salesValue - objSale.received;

    if (objSale.received > objSale.salesValue) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Amount more than balance",
      });
    }
    // objSale.profit =
    //   objSale.received -
    //   objSale.salesQuantity * objSale.branchStockId.stockId.unitsCost;
    objSale.realProfit =
      objSale.received -
      objSale.salesQuantity * objSale.branchStockId.stockId.unitsCost;

    const newPaymentSale = new paymentSaleModel({
      saleId: body.saleId,
      recipientId: body.recipientId,
      date: body.date,
      amount: body.amount,
      recived: objSale.received,
      balance: objSale.salesValue - objSale.received,
      note: body.note,
      profit: objSale.received,
    });

    await Promise.all([newPaymentSale.save(), objSale.save()]).then(
      async (result) => {
        const objLogClient = {
          clientId: objSale.clientId,
          paymentSaleId: result[0]._id,
          creationBy: req.userId,
          beforUpdatePaymentSale: null,
          afterUpdatePaymentSale: result[0]._doc,
          type: typeLogClientEnum.PAYMENTSALE,
          methodName: methodTypeEnum.CREATE,
          creationDate: new Date(),
        };
        await logClientModel.create(objLogClient);
      }
    );

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Created payment successfully",
    });
  } catch (error) {
    res;
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// update Sale
exports.updateInvoice = async (req, res, next) => {
  const paymentSaleId = req.params.id;
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
    const objpaymentSaleModel = await paymentSaleModel
      .findById(paymentSaleId)
      .populate({
        path: "saleId",
        model: "sale",
        populate: {
          path: "branchStockId",
          model: "branchStock",
          populate: {
            path: "stockId",
            model: "Stock",
          },
        },
      });
    if (!objpaymentSaleModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }
    const CopyObjPaymentSale = JSON.parse(JSON.stringify(objpaymentSaleModel));

    //return sale
    const objOldSale = await saleModel
      .findOne({ _id: objpaymentSaleModel.saleId })
      .populate({
        path: "branchStockId",
        model: "branchStock",
        populate: {
          path: "stockId",
          model: "Stock",
        },
      });

    objOldSale.received -= objpaymentSaleModel.amount;
    objOldSale.balance = objOldSale.salesValue - objOldSale.received;
    objOldSale.realProfit =
      objOldSale.received -
      objOldSale.salesQuantity * objOldSale.branchStockId.stockId.unitsCost;

    if (objOldSale.received + body.amount > objOldSale.salesValue) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Amount is more than sales value",
      });
    }
    // return res.json({received:objOldSale.received , amount:objpaymentSaleModel.amount})
    // return payment sale
    // objpaymentSaleModel.recived -= objpaymentSaleModel.amount;
    // objpaymentSaleModel.balance =
    //   objOldSale.salesValue - objpaymentSaleModel.recived;

    const oldListPayments = await paymentSaleModel.find({
      saleId: objpaymentSaleModel.saleId,
    });

    oldListPayments.forEach(async (ele) => {
      ele.recived = 0;
      ele.balance = 0;
      await ele.save();
    });

    // update payment sale
    // objpaymentSaleModel.recived += objpaymentSaleModel.amount;
    // objpaymentSaleModel.balance =
    //   objOldSale.salesValue - objpaymentSaleModel.recived;

    objpaymentSaleModel.amount = body.amount;
    objpaymentSaleModel.saleId = body.saleId;
    objpaymentSaleModel.recipientId = body.recipientId;
    objpaymentSaleModel.date = body.date;
    objpaymentSaleModel.note = body.note;

    let objNewSale = {};
    if (objOldSale._id.toString() !== objpaymentSaleModel.saleId.toString()) {
      objNewSale = await saleModel.findOne({ _id: body.saleId }).populate({
        path: "branchStockId",
        model: "branchStock",
        populate: {
          path: "stockId",
          model: "Stock",
        },
      });
    } else {
      objNewSale = objOldSale;
    }
    // update sale
    objNewSale.received += body.amount;
    objNewSale.balance = objNewSale.salesValue - objNewSale.received;
    objNewSale.realProfit =
      objNewSale.received -
      objNewSale.salesQuantity * objNewSale.branchStockId.stockId.unitsCost;

    await Promise.all([objpaymentSaleModel.save(), objNewSale.save()]).then(
      async (result) => {
        const newListPayments = await paymentSaleModel.find({
          saleId: objpaymentSaleModel.saleId,
        });

        newListPayments.forEach(async (ele, index) => {
          index
            ? (ele.recived = newListPayments[index - 1].recived + ele.amount)
            : (ele.recived = ele.amount);
          ele.balance = objOldSale.salesValue - ele.recived;
          await ele.save();
        });
        const objLogClient = {
          clientId: objOldSale.clientId,
          paymentSaleId: result[0]._id,
          creationBy: req.userId,
          beforUpdatePaymentSale: CopyObjPaymentSale,
          afterUpdatePaymentSale: result[0]._doc,
          type: typeLogClientEnum.PAYMENTSALE,
          methodName: methodTypeEnum.UPDATE,
          creationDate: new Date(),
        };
        await logClientModel.create(objLogClient);
      }
    );
    res.status(201).json({
      statusCode: res.statusCode,
      message: "Update Sale successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Sale
exports.deleteInvoice = async (req, res) => {
  const paymentSaleId = req.params.id;
  try {
    const objpaymentSaleModel = await paymentSaleModel
      .findById(paymentSaleId)
      .populate({
        path: "saleId",
        model: "sale",
        populate: {
          path: "branchStockId",
          model: "branchStock",
          populate: {
            path: "stockId",
            model: "Stock",
          },
        },
      });
    if (!objpaymentSaleModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }
    const CopyObjPaymentSale = JSON.parse(JSON.stringify(objpaymentSaleModel));

    //return sale
    const objOldSale = await saleModel
      .findOne({ _id: objpaymentSaleModel.saleId })
      .populate({
        path: "branchStockId",
        model: "branchStock",
        populate: {
          path: "stockId",
          model: "Stock",
        },
      });
    objOldSale.received -= objpaymentSaleModel.amount;
    objOldSale.balance = objOldSale.salesValue - objOldSale.received;
    objOldSale.realProfit =
      objOldSale.received -
      objOldSale.salesQuantity * objOldSale.branchStockId.stockId.unitsCost;

    await Promise.all([
      paymentSaleModel.deleteOne({ _id: paymentSaleId }),
      objOldSale.save(),
    ]).then(async (result) => {
      // Update all oldListPayments documents
      await paymentSaleModel.updateMany(
        { saleId: objpaymentSaleModel.saleId },
        { $set: { recived: 0, balance: 0 } }
      );

      // Retrieve the updated list of payments
      const newListPayments = await paymentSaleModel.find({
        saleId: objpaymentSaleModel.saleId,
      });

      // Calculate recived and balance for each payment
      let recivedSum = 0;
      newListPayments.forEach((ele, index) => {
        if (index === 0) {
          ele.recived = ele.amount;
        } else {
          ele.recived = recivedSum + ele.amount;
        }
        recivedSum = ele.recived;
        ele.balance = objOldSale.salesValue - ele.recived;
      });

      // Save the updated list of payments
      await Promise.all(newListPayments.map((ele) => ele.save()));
      const objLogClient = {
        clientId: objpaymentSaleModel.saleId.clientId,
        paymentSaleId: result[0]._id,
        creationBy: req.userId,
        beforUpdatePaymentSale: CopyObjPaymentSale,
        afterUpdatePaymentSale: result[0]._doc,
        type: typeLogClientEnum.PAYMENTSALE,
        methodName: methodTypeEnum.DELETE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Sale successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
