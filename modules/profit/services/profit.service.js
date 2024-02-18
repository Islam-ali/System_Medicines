const saleModel = require("../../sale/model/sale.model");
const PaymentForFactory = require("../../PaymentForFactories/model/paymentForFactories.model");
const { sum } = require("lodash");

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

exports.getAllProfitByExpences = async (req, res, next) => {
  try {
    const allExpences = await PaymentForFactory.aggregate([
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
    ]);

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allExpences,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
