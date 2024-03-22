const stockModel = require("../model/stock.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const logStock = require("../model/logStock.model");
const mongoose = require("mongoose");
const ourRequest = require("../../ourRequest/model/ourRequest.model");
const OrderStatus = require("../../../core/enums/OrderStatus.enum");
const { sum } = require("lodash");
const logTransfer = require("../model/logTransferStock");

// Get Factory Stock
exports.getStock = async (req, res) => {
  const query = {};
  if (req.query.status) {
    query["status"] = req.query.status;
  }
    if (req.query.orderType) {
      query["ourRequestId.orderType"] = req.query.orderType;
    }
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
        $match: query,
      },
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
          from: "itemsfactories",
          localField: "itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
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
          itemName: { $first: "$itemFactoryId.name" },
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
      data: listOfStock.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Factory Stock
exports.getStockByClassificationId = async (req, res) => {
  try {
    let query = {};
    const factoryId = req.query.factoryId;
    if (factoryId) {
      query["factoryId._id"] = new mongoose.Types.ObjectId(factoryId);
    }

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
          from: "itemsfactories",
          localField: "itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
      {
        $match: query,
      },
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
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfStock.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogStock = async (req, res) => {
  try {
    const listOfLogStock = await logStock.find();

    // .aggregate([
    //   {
    //     $lookup: {
    //       from: "stocks",
    //       localField: "stockId",
    //       foreignField: "_id",
    //       as: "stockId",
    //     },
    //   },
    //   { $unwind: "$stockId" },
    //   {
    //     $lookup: {
    //       from: "ourrequests",
    //       localField: "stockId.ourRequestId",
    //       foreignField: "_id",
    //       as: "ourRequestId",
    //     },
    //   },
    //   { $unwind: "$ourRequestId" },
    //   {
    //     $lookup: {
    //       from: "factories",
    //       localField: "ourRequestId.factoryId",
    //       foreignField: "_id",
    //       as: "factoryId",
    //     },
    //   },
    //   { $unwind: "$factoryId" },
    //   {
    //     $lookup: {
    //       from: "typeoffactories",
    //       localField: "factoryId.typeOfFactoryId",
    //       foreignField: "_id",
    //       as: "typeOfFactoryId",
    //     },
    //   },
    //   { $unwind: "$typeOfFactoryId" },
    // ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfLogStock.reverse(),
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

exports.returnOurRequest = async (req, res) => {
  try {
    const objStock = await stockModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
      },
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
          from: "itemsfactories",
          localField: "ourRequestId.itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
    ]);

    if (!objStock[0]) {
      return res.status(404).json({ message: "Stock not found" });
    }
    console.log(objStock[0].ourRequestId.unitsNumber, objStock[0].unitsNumber);
    if (objStock[0].ourRequestId.unitsNumber !== objStock[0].unitsNumber) {
      return res.status(400).json({ message: "can't Return" });
    }
    const filter = { _id: objStock[0].ourRequestId._id };
    const updateDocument = {
      $set: { orderStatus: OrderStatus.RETURN },
    };
    await ourRequest.updateOne(filter, updateDocument).then(async (result) => {
      await stockModel.deleteOne({ _id: req.params.id });
      const objLogStock = new logStock({
        itemName: objStock[0].ourRequestId.itemFactoryId.name,
        factoryName: objStock[0].factoryId.name,
        unitsNumber: objStock[0].ourRequestId.unitsNumber,
        unitsCost: objStock[0].ourRequestId.unitsCost,
        totalcost: objStock[0].ourRequestId.totalcost,
        orderStatus: OrderStatus.RETURN,
        insertDate: new Date(),
      });
      await objLogStock.save();
      res.status(201).json({
        statusCode: res.statusCode,
        message: "Return successfully",
      });
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

    // check exist in branch stock
    let objBranchStock = await branchStockModel.findOne({
      patchNumber: objStock.patchNumber,
      userId: userId,
    });

    if (objBranchStock) {
      // Update branch stock
      objBranchStock.publicPrice = publicPrice;
      objBranchStock.unitsNumber += unitsNumber;
      objBranchStock.patchNumber = objStock.patchNumber;
      await objBranchStock.save();
    } else {
      // create new branch stock
      objBranchStock = {
        stockId: stockId,
        userId: userId,
        publicPrice: publicPrice,
        unitsNumber: unitsNumber,
        patchNumber: objStock.patchNumber,
        date: date,
      };
      await branchStockModel.create(objBranchStock);
    }

    // update stock
    objStock.unitsNumber = objStock.unitsNumber - unitsNumber;
    objStock.totalcost = objStock.unitsNumber * objStock.unitsCost;

    await objStock.save();

    const objLogTransfer = new logTransfer({
      orderStatus: OrderStatus.SENT,
      stockId: objStock._id,
      userId: userId,
      unitsNumber: unitsNumber,
      publicPrice: publicPrice,
      totalcost: unitsNumber * publicPrice,
      insertDate: date,
    });
    await objLogTransfer.save();
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

    if (objBranchStockModel.unitsNumber === 0) {
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
    await Promise.all([objBranchStockModel.save(), objStock.save()]).then(
      async (result) => {
        const objLogTransfer = new logTransfer({
          orderStatus: OrderStatus.RETURN,
          stockId: objStock._id,
          userId: objBranchStockModel.userId,
          unitsNumber: objBranchStockModel.unitsNumber,
          publicPrice: objBranchStockModel.publicPrice,
          totalcost:
            objBranchStockModel.unitsNumber * objBranchStockModel.publicPrice,
          insertDate: new Date(),
        });
        await objLogTransfer.save();
      }
    );

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "Transaction successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalAmountInStock = async (req, res) => {
  try {
    const listOfStock = await stockModel.find();

    const totalAmountRowMaterials = listOfStock.reduce((sum, item) => {
      if (item.classificationId === 1) {
        return sum + item.totalcost;
      }
      return sum;
    }, 0);
    const totalAmountManufacturing = listOfStock.reduce((sum, item) => {
      if (item.classificationId === 2) {
        return sum + item.totalcost;
      }
      return sum;
    }, 0);
    const totalAmount = sum(listOfStock.map((stock) => stock.totalcost));

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalAmountRowMaterials: totalAmountRowMaterials,
        totalAmountManufacturing: totalAmountManufacturing,
        totalAmount: totalAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changeStatusStock = async (req, res) => {
  try {
    const objStock = await stockModel.findOne({
      _id: req.params.id,
    });

    if (!objStock) {
      return res.status(404).json({
        message: "Branch stock not found",
      });
    }

    objStock.status = req.body.status;
    objStock.save();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getLogTransfer = async (req, res) => {
  try {
    const listOfLogTransfer = await logTransfer.aggregate([
      {
        $lookup: {
          from: "stocks",
          localField: "stockId",
          foreignField: "_id",
          as: "stockId",
        },
      },
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
          from: "itemsfactories",
          localField: "ourRequestId.itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfLogTransfer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};