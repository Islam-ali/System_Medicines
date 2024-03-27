const saleModel = require("../model/sale.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const stockModel = require("../../stock/model/stock.model");
const logClientModel = require("../../log-client/model/log-client.model");
const paymentSaleModel = require("../../paymentSale/model/paymentSale.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const methodTypeEnum = require("../../../core/enums/methoType.enum");
const typeLogClientEnum = require("../../../core/enums/typeLogClient.enum");
const UserRole = require("../../../core/enums/role.enum");
const mongoose = require("mongoose");

// get All type of Factories
exports.getAllSales = async (req, res, next) => {
  try {
    let query = {};
    const clientId = req.query.clientId;
    const userId = req.userId;
    const isAllow = req.roleName == UserRole.ADMIN;
    const fromDate = req.query.fromDate; // Assuming fromDate is provided in the request query
    const toDate = req.query.toDate; // Assuming toDate is provided in the request query

    if (!isAllow) {
      query["userId"] = new mongoose.Types.ObjectId(userId);
    }
    if (clientId) {
      query["clientId"] = new mongoose.Types.ObjectId(clientId);
    }

    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const allSale = await saleModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "branchstocks",
          localField: "branchStockId",
          foreignField: "_id",
          as: "branchStockId", // This is the additional lookup
        },
      },
      { $unwind: "$branchStockId" }, // Unwind the new field
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockId.stockId",
          foreignField: "_id",
          as: "branchStockId.stockId",
        },
      },
      { $unwind: "$branchStockId.stockId" },
      {
        $lookup: {
          from: "itemsfactories",
          localField: "branchStockId.stockId.itemFactoryId",
          foreignField: "_id",
          as: "branchStockId.stockId.itemFactoryId",
        },
      },
      { $unwind: "$branchStockId.stockId.itemFactoryId" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allSale.reverse(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// get All type of Factories
exports.getAllSalesByClientId = async (req, res, next) => {
  try {
    const clientId = req.params.clientId;
    const userId = req.userId;
    const allSales = await saleModel
      .find({ clientId, userId, deleted: false })
      .populate({
        path: "userId",
        model: "users",
        select: "-password -roleId",
      })
      .populate({
        path: "branchStockId",
        model: "branchStock",
        populate: {
          path: "stockId",
          model: "Stock",
        },
      })
      .populate({
        path: "clientId",
        model: "client",
      });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allSales.reverse(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const listOfSale = await saleModel
      .find({
        governmentId: req.params.governmentId,
      })
      .populate("governmentId");
    if (!listOfSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Government not Result",
        data: listOfSale,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfSale,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Sale
exports.createSale = async (req, res, next) => {
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
    const isAllow = req.roleName == UserRole.ADMIN;
    const userId = isAllow ? body.userId : req.userId;
    const objBranchStock = await branchStockModel
      .findOne({
        userId: userId,
        _id: body.branchStockId,
      })
      .populate({
        path: "userId",
        model: "users",
        select: "_roleId",
      })
      .populate({
        path: "stockId",
        model: "Stock",
      });
    if (!objBranchStock) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Branch stock not found",
      });
    }
    if (objBranchStock.unitsNumber < body.salesQuantity) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "sales Quantity more than units Number in stock ",
      });
    }
    // Perform calculations
    const pharmacyPrice =
      ((100 - body.discount) / 100) * objBranchStock.publicPrice;
    // const payment = body.payment;
    const salesValue = pharmacyPrice * body.salesQuantity;
    const netProfit = pharmacyPrice - objBranchStock.stockId.unitsCost;
    const totalNetProfit = netProfit * body.salesQuantity;
    const newSale = new saleModel({
      branchStockId: body.branchStockId,
      clientId: body.clientId,
      userId: userId,
      date: body.date,
      discount: body.discount || 0,
      bouns: body.bouns || 0,
      salesQuantity: body.salesQuantity,
      // payment: payment,
      // calculates
      received: 0,
      pharmacyPrice: pharmacyPrice,
      salesValue: salesValue,
      balance: salesValue,
      netProfit: netProfit,
      totalNetProfit: totalNetProfit,
      realProfit: 0,
    });
    // update branch stock
    objBranchStock.unitsNumber -= body.salesQuantity;

    // update stock
    // const objStock = await stockModel.findOne({ _id: objBranchStock.stockId });

    // objStock.unitsNumber -= body.salesQuantity;
    // objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    await Promise.all([
      newSale.save(),
      objBranchStock.save(),
      // objStock.save(),
    ]).then(async (result) => {
      const objLogClient = {
        clientId: result[0].clientId,
        saleId: result[0]._id,
        creationBy: req.userId,
        beforUpdateSale: null,
        afterUpdateSale: result[0],
        type: typeLogClientEnum.SALE,
        methodName: methodTypeEnum.CREATE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Created Sale successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create sale",
      error: error.message,
    });
  }
};

// update Sale
exports.updateSale = async (req, res, next) => {
  const saleId = req.params.id;
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
    const isAllow = req.roleName == UserRole.ADMIN;
    const userId = isAllow ? body.userId : req.userId;
    const objSale = await saleModel.findById(saleId);
    if (!objSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }
    const CopyObjSale = JSON.parse(JSON.stringify(objSale));
    const objBranchStock = await branchStockModel
      .findOne({
        userId: userId,
        _id: body.branchStockId,
      })
      .populate({
        path: "userId",
        model: "users",
        select: "_roleId",
      })
      .populate({
        path: "stockId",
        model: "Stock",
      });
    if (!objBranchStock) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Branch stock not found",
      });
    }
    const objStock = await stockModel.findOne({ _id: objBranchStock.stockId });
    // update branch stock
    objBranchStock.unitsNumber =
      objBranchStock.unitsNumber + objSale.salesQuantity;

    // update stock
    // objStock.unitsNumber = objStock.unitsNumber + objSale.salesQuantity;
    // objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    if (objBranchStock.unitsNumber < body.salesQuantity) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "sales Quantity more than units Number in stock ",
      });
    }
    // Perform calculations
    const pharmacyPrice =
      ((100 - body.discount) / 100) * objBranchStock.publicPrice;
    // const payment = objSale.payment;
    const salesValue = pharmacyPrice * body.salesQuantity;
    const netProfit = pharmacyPrice - objStock.unitsCost;
    const totalNetProfit = netProfit * body.salesQuantity;

    // update Sale
    objSale.branchStockId = body.branchStockId;
    objSale.clientId = body.clientId;
    (objSale.userId = userId), (objSale.date = body.date);
    objSale.discount = body.discount || 0;
    objSale.bouns = body.bouns || 0;
    objSale.salesQuantity = body.salesQuantity;
    // objSale.payment = payment;
    // calculates
    // objSale.received = payment;
    objSale.pharmacyPrice = pharmacyPrice;
    objSale.salesValue = salesValue;
    objSale.balance = salesValue - objSale.received;
    objSale.netProfit = netProfit;
    objSale.totalNetProfit = totalNetProfit;
    objSale.realProfit = objSale.received - objSale.totalNetProfit;

    // update branch stock
    objBranchStock.unitsNumber =
      objBranchStock.unitsNumber - body.salesQuantity;

    // update stock
    // objStock.unitsNumber = objStock.unitsNumber - body.salesQuantity;
    // objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    // Save the updated sale
    await Promise.all([
      objSale.save(),
      objBranchStock.save(),
      // objStock.save(),
    ]).then(async (result) => {
      const objLogClient = {
        clientId: result[0].clientId,
        saleId: result[0]._doc,
        creationBy: req.userId,
        beforUpdateSale: CopyObjSale,
        afterUpdateSale: result[0]._doc,
        type: typeLogClientEnum.SALE,
        methodName: methodTypeEnum.UPDATE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });

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

// Delete Sale by soft delete
exports.deleteSale = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objSale = await saleModel
      .findOne(filter)
      .populate({
        path: "userId",
        model: "users",
        select: "-password -roleId",
      })
      .populate({
        path: "branchStockId",
        model: "branchStock",
        populate: {
          path: "stockId",
          model: "Stock",
        },
      })
      .populate({
        path: "clientId",
        model: "client",
      });
    if (!objSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Sale",
      });
    }
    const CopyObjSale = JSON.parse(JSON.stringify(objSale));
    const userId = objSale.branchStockId.userId._id;
    const objBranchStock = await branchStockModel
      .findOne({
        userId: userId,
        _id: objSale.branchStockId,
      })
      .populate({
        path: "userId",
        model: "users",
        select: "_roleId",
      })
      .populate({
        path: "stockId",
        model: "Stock",
      });

    // const objStock = await stockModel.findOne({ _id: objBranchStock.stockId });
    // update branch stock
    objBranchStock.unitsNumber =
      objBranchStock.unitsNumber + objSale.salesQuantity;

    // // update stock
    // objStock.unitsNumber = objStock.unitsNumber + objSale.salesQuantity;
    // objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;
    await Promise.all([
      saleModel.deleteOne({ _id: req.params.id }),
      objBranchStock.save(),
      // objStock.save(),
      paymentSaleModel.deleteMany({ saleId: objSale._id }),
    ]).then(async (result) => {
      const objLogClient = {
        clientId: CopyObjSale.clientId._id,
        saleId: CopyObjSale._id,
        creationBy: req.userId,
        beforUpdateSale: CopyObjSale,
        afterUpdateSale: null,
        type: typeLogClientEnum.SALE,
        methodName: methodTypeEnum.DELETE,
        creationDate: new Date(),
      };
      await logClientModel.create(objLogClient);
    });
    // .catch((error) => {
    //   res.status(400).json({
    //     statusCode: res.statusCode,
    //     message: "failed",
    //     error: error,
    //   });
    // });
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
