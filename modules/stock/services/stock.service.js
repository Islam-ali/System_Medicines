const stockModel = require("../model/stock.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const logStock = require("../model/logStock.model");

// Get Factory Stock
exports.getStock = async (req, res) => {
  try {
    const listOfStock = await stockModel.aggregate([
      {
        $lookup: {
          from: "ourrequests",
          localField: "ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
      { $unwind: "$ourRequestId" },
      {
        $lookup: {
          from: "factories",
          localField: "ourRequestId.factoryId",
          foreignField: "_id",
          as: "factoryId",
        },
      },
      { $unwind: "$factoryId" },
      {
        $lookup: {
          from: "typeoffactories",
          localField: "factoryId.typeOfFactoryId",
          foreignField: "_id",
          as: "typeOfFactoryId",
        },
      },
      { $unwind: "$typeOfFactoryId" },
      {
        $match: {
          "typeOfFactoryId.classificationId": parseInt(
            req.params.classificationId
          ),
        },
      },
      {
        $group: {
          _id: "$itemFactoryId",
          stocks: { $push: "$$ROOT" },
          itemName: { $first: "$itemName" },
          factoryType: { $first: "$typeOfFactoryId.type" },
          totalcost: { $sum: "$totalcost" },
          totalUnitsNumber: { $sum: "$unitsNumber" },
          totalUnitsCost: { $sum: "$unitsCost" },
        },
      },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Factory Stock
exports.getStockByClassificationId = async (req, res) => {
  try {
    const listOfStock = await stockModel
      .find({
        classificationId: req.params.classificationId,
      })
      .populate({
        path: "ourRequestId",
        populate: {
          path: "itemFactoryId",
          model: "ItemsFactory",
          select: "name -_id",
        },
      });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogStock = async (req, res) => {
  try {
    const listOfLogStock = await logStock.aggregate([
      {
        $lookup: {
          from: "stocks",
          localField: "stockId",
          foreignField: "_id",
          as: "stockId",
        },
      },
      { $unwind: "$stockId" },
      {
        $lookup: {
          from: "ourrequests",
          localField: "stockId.ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
      { $unwind: "$ourRequestId" },
      {
        $lookup: {
          from: "factories",
          localField: "ourRequestId.factoryId",
          foreignField: "_id",
          as: "factoryId",
        },
      },
      { $unwind: "$factoryId" },
      {
        $lookup: {
          from: "typeoffactories",
          localField: "factoryId.typeOfFactoryId",
          foreignField: "_id",
          as: "typeOfFactoryId",
        },
      },
      { $unwind: "$typeOfFactoryId" },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfLogStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const objStock = await stockModel
      .findOne({
        _id: req.params.id,
      })
      .populate({
        path: "ourRequestId",
        populate: {
          path: "itemFactoryId",
          model: "ItemsFactory",
          select: "name -_id",
        },
      });
    if (!objStock) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "stock not Result",
        data: objStock,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInfoInStock = async (req, res) => {
  const { patchNumber, manfDate, expDate } = req.body;
  if (!patchNumber || !manfDate || !expDate) {
    return res.status(400).json({ message: "invalid Data" });
  }
  try {
    const objStock = await stockModel.findOne({ _id: req.params.id });
    if (!objStock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    objStock.patchNumber = patchNumber;
    objStock.manfDate = manfDate;
    objStock.expDate = expDate;

    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.transactionToBranchStock = async (req, res) => {
  const { stockId, unitsNumber, userId, date, publicPrice } = req.body;
  if (!stockId || !unitsNumber || !userId || !date || !publicPrice) {
    return res.status(400).json({ message: "invalid Data" });
  }
  try {
    const objStock = await stockModel.findOne({ _id: stockId });
    if (!objStock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    if (objStock.unitsNumber < unitsNumber) {
      return res.status(400).json({ message: "units number more than stock" });
    }
    // create new branch stock
    const newBranchStock = {};
    newBranchStock.stockId = stockId;
    newBranchStock.userId = userId;
    newBranchStock.publicPrice = publicPrice;
    newBranchStock.unitsNumber = unitsNumber;
    newBranchStock.date = date;

    // update stock
    objStock.unitsNumber = objStock.unitsNumber - unitsNumber;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    await branchStockModel.create(newBranchStock);
    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "transaction successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.transactionFromBranchStockToStock = async (req, res) => {
  try {
    const branchStockId = req.params.branchStockId;

    // Find the branch stock
    const objBranchStockModel = await branchStockModel.findOne({
      _id: branchStockId,
    });

    if (!objBranchStockModel) {
      return res.status(404).json({ message: "Branch stock not found" });
    }

    if(objBranchStockModel.unitsNumber === 0){
      return res.status(404).json({ message: "not Found units Number" });
    }
    // Find the stock associated with the branch stock
    const objStock = await stockModel.findOne({
      _id: objBranchStockModel.stockId,
    });

    if (!objStock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Update stock information
    objStock.unitsNumber += objBranchStockModel.unitsNumber;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    objBranchStockModel.unitsNumber -= objBranchStockModel.unitsNumber;
    // Delete the branch stock and save the updated stock
    await Promise.all([objBranchStockModel.save(), objStock.save()]);

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "Transaction successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
