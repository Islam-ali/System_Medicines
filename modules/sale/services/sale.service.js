const saleModel = require("../model/sale.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const stockModel = require("../../stock/model/stock.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");

// get All type of Factories
exports.getAllSale = async (req, res, next) => {
  try {
    const allSale = await saleModel.find().populate("branchStockId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allSale,
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
    const objBranchStock = await branchStockModel
      .findOne({
        userId: req.userId,
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
      userId: body.userId,
      date: body.date,
      discount: body.discount || 0,
      bouns: body.bouns || 0,
      salesQuantity: body.salesQuantity,
      // payment: payment,
      // calculates
      received: 0,
      pharmacyPrice: pharmacyPrice,
      salesValue: salesValue,
      balance: 0,
      netProfit: netProfit,
      totalNetProfit: totalNetProfit,
    });
    // update branch stock
    objBranchStock.unitsNumber -= body.salesQuantity;

    // update stock
    const objStock = await stockModel.findOne({_id:objBranchStock.stockId}); 

    objStock.unitsNumber -= body.salesQuantity;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    await Promise.all([newSale.save(), objBranchStock.save(), objStock.save()]);

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
    const objSale = await saleModel.findById(saleId);

    if (!objSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Sale not found",
      });
    }

    const objBranchStock = await branchStockModel
      .findOne({
        userId: req.userId,
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
    const objStock = await stockModel.findOne({_id:objBranchStock.stockId}); 
    // update branch stock
    objBranchStock.unitsNumber = objBranchStock.unitsNumber + objSale.salesQuantity;

    // update stock
    objStock.unitsNumber = objStock.unitsNumber + objSale.salesQuantity;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    if (objBranchStock.unitsNumber < body.salesQuantity) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "sales Quantity more than units Number in stock ",
      });
    }
    // Perform calculations
    const pharmacyPrice = ((100 - body.discount) / 100) * objBranchStock.publicPrice;
    // const payment = objSale.payment;
    const salesValue = pharmacyPrice * body.salesQuantity;
    const netProfit = pharmacyPrice - objStock.unitsCost;
    const totalNetProfit = netProfit * body.salesQuantity;

    // update Sale
      objSale.branchStockId = body.branchStockId;
      objSale.clientId = body.clientId;
      objSale.userId = body.userId,
      objSale.date = body.date;
      objSale.discount = body.discount || 0;
      objSale.bouns = body.bouns || 0;
      objSale.salesQuantity = body.salesQuantity;
      // objSale.payment = payment;
      // calculates
      // objSale.received = payment;
      objSale.pharmacyPrice = pharmacyPrice;
      objSale.salesValue = salesValue;
      // objSale.balance = salesValue - payment;
      objSale.netProfit = netProfit;
      objSale.totalNetProfit = totalNetProfit;

    // update branch stock
    objBranchStock.unitsNumber = objBranchStock.unitsNumber - body.salesQuantity;

    // update stock
    objStock.unitsNumber = objStock.unitsNumber - body.salesQuantity;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    // Save the updated sale
    await Promise.all([objSale.save(), objBranchStock.save(), objStock.save()]);

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
exports.deleteSale = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objSale = await saleModel.findOne(filter);
    if (!objSale) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Sale",
      });
    }
    const objBranchStock = await branchStockModel
      .findOne({
        userId: req.userId,
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
      
      const objStock = await stockModel.findOne({_id:objBranchStock.stockId}); 
    // update branch stock
    objBranchStock.unitsNumber = objBranchStock.unitsNumber + objSale.salesQuantity;

    // update stock
    objStock.unitsNumber = objStock.unitsNumber + objSale.salesQuantity;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    await saleModel.deleteOne(filter).then(async (deletedSale) => {
      await objBranchStock.save();
      await objStock.save();
    })
    .catch((error) => {
      res.status(400).json({
        statusCode: res.statusCode,
        message: "failed",
      });
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
