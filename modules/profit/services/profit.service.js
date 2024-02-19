const saleModel = require("../../sale/model/sale.model");
const ourRequestModel = require("../../ourRequest/model/ourRequest.model");
const { sum } = require("lodash");
const PaymentForFactoryModel = require("../../PaymentForFactories/model/paymentForFactories.model");

exports.getAllProfitByIncomes = async (req, res, next) => {
  try {
    const allIncomes = await saleModel.aggregate([
      {
        $lookup: {
          from: "branchstocks",
          localField: "branchStockId",
          foreignField: "_id",
          as: "branchStockId",
        },
      },
      { $unwind: "$branchStockId" },
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
          from: "stocks",
          localField: "branchStockId.stockId",
          foreignField: "_id",
          as: "branchStockId.stockId",
        },
      },
      { $unwind: "$branchStockId.stockId" },
      //   {
      // $addFields: {
      //   profit: {
      //     $sum: [
      //       "$realProfit"
      //     ],
      //   },
      // },
      //   },
    ]);

    // Calculate total profit
    const totalProfit = sum(allIncomes.map((income) => income.realProfit));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all incomes",
      data: allIncomes,
      totalProfit: totalProfit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getTotalRecivedAndBalanceAndProfit = async (req, res, next) => {
  try {
    const allIncomes = await saleModel.aggregate([
      {
        $group: {
          _id: null,
          totalRealProfit: { $sum: "$realProfit" },
          totalBalance: { $sum: "$balance" },
          totalReceived: { $sum: "$received" },
        },
      },
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all incomes",
      data: allIncomes[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getAllExpences = async (req, res, next) => {
  try {
    const allExpences = await PaymentForFactoryModel.aggregate([
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


exports.getTotalCashAmountAndBalance = async (req, res, next) => {
  try {
    const allExpences = await PaymentForFactoryModel.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          totalCashAmount: { $sum: "$cashAmount" },
        },
      },
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all Expences",
      data: allExpences[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};