const paymentSaleModel = require("../model/paymentSale.model");
const saleModel = require("../../sale/model/sale.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const stockModel = require("../../stock/model/stock.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");

// get All type of Factories
exports.getAllPaymentSale = async (req, res, next) => {
  const userId = req.userId;
  // const isAllow = req.permissions.includes('getAllPaymentSale.view');
  let query = {};
  // if (!isAllow) {
  //   query = { userId: userId };
  // }
  try {
    const allPaymentSale = await paymentSaleModel
      .find(query)
      .populate("saleId");
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

exports.getPaymentSaleById = async (req, res) => {
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
exports.createPaymentSale = async (req, res, next) => {
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
    objSale.profit =
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
    });

    await Promise.all([newPaymentSale.save(), objSale.save()]);

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
exports.updatePaymentSale = async (req, res, next) => {
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
    const objpaymentSaleModel = await paymentSaleModel.findById(paymentSaleId);
    if (!objpaymentSaleModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }

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
    objOldSale.profit =
      objOldSale.received -
      (objOldSale.salesQuantity * objOldSale.branchStockId.stockId.unitsCost);

    // return payment sale
    objpaymentSaleModel.recived -= objpaymentSaleModel.amount;
    objpaymentSaleModel.balance =
      objOldSale.salesValue - objpaymentSaleModel.recived;

    objpaymentSaleModel.amount = body.amount;

    // update payment sale
    objpaymentSaleModel.recived += objpaymentSaleModel.amount;
    objpaymentSaleModel.balance =
      objOldSale.salesValue - objpaymentSaleModel.recived;

    objpaymentSaleModel.saleId = body.saleId;
    objpaymentSaleModel.recipientId = body.recipientId;
    objpaymentSaleModel.date = body.date;
    objpaymentSaleModel.note = body.note;
    let objNewSale = {};
    if (objOldSale._id !== objpaymentSaleModel.saleId) {
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
    objNewSale.profit =
    objNewSale.received -
    (objNewSale.salesQuantity * objNewSale.branchStockId.stockId.unitsCost);
    await Promise.all([
      objOldSale.save(),
      objpaymentSaleModel.save(),
      objNewSale.save(),
    ]);
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
exports.deletePaymentSale = async (req, res) => {
  const paymentSaleId = req.params.id
  try {
    const objpaymentSaleModel = await paymentSaleModel.findById(paymentSaleId);
    if (!objpaymentSaleModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }

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
    objOldSale.profit =
      objOldSale.received -
      (objOldSale.salesQuantity * objOldSale.branchStockId.stockId.unitsCost);


      await Promise.all([
        paymentSaleModel.deleteOne({_id:paymentSaleId}),
        objOldSale.save(),
      ]);

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
