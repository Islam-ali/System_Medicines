const { sum } = require("lodash");
const PaymentForFactoryModel = require("../../PaymentForFactories/model/paymentForFactories.model");
const paymentSaleModel = require("../../paymentSale/model/paymentSale.model");

exports.getAllIncomes = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    };

    const allIncomes = await paymentSaleModel.aggregate([
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
          from: "clients",
          localField: "saleId.clientId",
          foreignField: "_id",
          as: "saleId.clientId",
        },
      },
      { $unwind: "$saleId.clientId" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleId.branchStockId",
          foreignField: "_id",
          as: "saleId.branchStockId",
        },
      },
      { $unwind: "$saleId.branchStockId" },
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
        $match: matchQuery,
      },
    ]);
    // Calculate total profit
    const totalRecived = sum(allIncomes.map((income) => income.amount));
    const totalBalance = sum(allIncomes.map((income) => income.balance));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all incomes",
      data: allIncomes,
      totalRecived: totalRecived,
      totalBalance: totalBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getAllExpences = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, year] },
          { $eq: [{ $month: "$cashDate" }, month] },
        ],
      },
    };
    const allExpences = await PaymentForFactoryModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "ourrequests",
          localField: "ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
      {
        $unwind: "$ourRequestId",
      },
      {
        $lookup: {
          from: "itemsfactories",
          localField: "ourRequestId.itemFactoryId",
          foreignField: "_id",
          as: "factoryId",
        },
      },
      { $unwind: "$factoryId" },
      {
        $group: {
          _id: "$ourRequestId", // Group by ourRequestId
          payments: { $push: "$$ROOT" }, // Push all payment documents into an array
          totalRecived: { $sum: "$ourRequestId.wasPaid" },
          totalcost: { $first: "$ourRequestId.totalcost" },
          itemName: { $first: "$stockInfo.itemName" },
        },
      },
      {
        $addFields: {
          totalBalance: {
            $subtract: ["$totalcost", "$totalRecived"],
          },
        },
      },
    ]);

    const totalCashAmount = sum(allExpences.map((income) => income.cashAmount));
    const totalBalance = sum(allExpences.map((income) => income.balance));

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allExpences,
      totalCashAmount: totalCashAmount,
      totalBalance: totalBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getAllProfitIncomes = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    };
    const allProfit = await paymentSaleModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$saleInfo" },
      {
        $lookup: {
          from: "clients",
          localField: "saleInfo.clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleInfo.branchStockId",
          foreignField: "_id",
          as: "branchStockInfo",
        },
      },
      { $unwind: "$branchStockInfo" },
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockInfo.stockId",
          foreignField: "_id",
          as: "stockInfo",
        },
      },
      { $unwind: "$stockInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
      {
        $addFields: {
          totalCost: {
            $multiply: ["$stockInfo.unitsCost", "$saleInfo.salesQuantity"],
          },
        },
      },
      {
        $group: {
          _id: "$saleId", // Group by saleId
          payments: { $push: "$$ROOT" }, // Push all payment documents into an array
          totalCost: { $sum: "$totalCost" }, // Sum the total cost for each saleId
          totalRecived: { $sum: "$amount" },
          clientName: { $first: "$clientInfo.name" },
          clientId: { $first: "$clientInfo._id" },
          salesValue: { $first: "$saleInfo.salesValue" },
          itemName: { $first: "$stockInfo.itemName" },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ["$totalRecived", "$totalCost"] },
          totalBalance: {
            $subtract: ["$salesValue", "$totalRecived"],
          },
        },
      },
    ]);

    const totalBalance = sum(allProfit.map((profit) => profit.totalBalance));
    const totalRecived = sum(allProfit.map((profit) => profit.totalRecived));
    const totalProfit = sum(allProfit.map((profit) => profit.profit));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully",
      data: allProfit,
      totalBalance: totalBalance,
      totalRecived: totalRecived,
      totalProfit: totalProfit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
